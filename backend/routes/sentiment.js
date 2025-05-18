// routes/sentiment.js - Routes for sentiment analysis data

const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const SentimentData = require('../models/SentimentData');
const SentimentTrend = require('../models/SentimentTrend');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

/**
 * @route   GET /api/sentiment/overview
 * @desc    Get sentiment overview data
 * @access  Private
 */
router.get('/overview', authenticateUser, async (req, res) => {
  try {
    const { timeframe = 'monthly', startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.timestamp = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    } else {
      // Default to last 30 days if no dates specified
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultStartDate.getDate() - 30);
      dateFilter.timestamp = { $gte: defaultStartDate };
    }

    // Format based on requested timeframe
    let dateFormat;
    switch (timeframe) {
      case 'daily':
        dateFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        dateFormat = '%Y-W%U'; // Year-WeekNumber
        break;
      case 'monthly':
      default:
        dateFormat = '%Y-%m';
    }

    // Aggregate sentiment data
    const sentimentTrends = await SentimentData.aggregate([
      { $match: dateFilter },
      { $group: {
          _id: { $dateToString: { format: dateFormat, date: '$timestamp' } },
          positive: { 
            $sum: { $cond: [{ $gt: ['$score', 0.2] }, 1, 0] } 
          },
          neutral: { 
            $sum: { 
              $cond: [
                { $and: [
                  { $gte: ['$score', -0.2] }, 
                  { $lte: ['$score', 0.2] }
                ]}, 
                1, 
                0
              ] 
            } 
          },
          negative: { 
            $sum: { $cond: [{ $lt: ['$score', -0.2] }, 1, 0] } 
          },
          total: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } },
      { $project: {
          _id: 0,
          date: '$_id',
          positive: 1,
          neutral: 1,
          negative: 1,
          total: 1,
          positivePercent: { $multiply: [{ $divide: ['$positive', '$total'] }, 100] },
          neutralPercent: { $multiply: [{ $divide: ['$neutral', '$total'] }, 100] },
          negativePercent: { $multiply: [{ $divide: ['$negative', '$total'] }, 100] }
        }
      }
    ]);

    // Get overall sentiment
    const overallSentiment = await SentimentData.aggregate([
      { $match: dateFilter },
      { $group: {
          _id: null,
          positive: { $sum: { $cond: [{ $gt: ['$score', 0.2] }, 1, 0] } },
          neutral: { 
            $sum: { 
              $cond: [
                { $and: [
                  { $gte: ['$score', -0.2] }, 
                  { $lte: ['$score', 0.2] }
                ]}, 
                1, 
                0
              ] 
            } 
          },
          negative: { $sum: { $cond: [{ $lt: ['$score', -0.2] }, 1, 0] } },
          total: { $sum: 1 },
          avgScore: { $avg: '$score' }
        }
      },
      { $project: {
          _id: 0,
          positive: 1,
          neutral: 1,
          negative: 1,
          total: 1,
          avgScore: 1,
          positivePercent: { $multiply: [{ $divide: ['$positive', '$total'] }, 100] },
          neutralPercent: { $multiply: [{ $divide: ['$neutral', '$total'] }, 100] },
          negativePercent: { $multiply: [{ $divide: ['$negative', '$total'] }, 100] }
        }
      }
    ]);

    // Get previous period data for trend calculation
    const previousPeriodStartDate = new Date(dateFilter.timestamp.$gte);
    const previousPeriodDays = (endDate && startDate) 
      ? (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
      : 30;
    
    previousPeriodStartDate.setDate(previousPeriodStartDate.getDate() - previousPeriodDays);
    const previousPeriodEndDate = new Date(dateFilter.timestamp.$gte);
    previousPeriodEndDate.setDate(previousPeriodEndDate.getDate() - 1);

    const previousPeriodSentiment = await SentimentData.aggregate([
      { 
        $match: { 
          timestamp: { 
            $gte: previousPeriodStartDate, 
            $lte: previousPeriodEndDate 
          } 
        } 
      },
      { 
        $group: {
          _id: null,
          avgScore: { $avg: '$score' },
          total: { $sum: 1 }
        }
      },
      { $project: { _id: 0, avgScore: 1, total: 1 } }
    ]);

    // Calculate trend
    let trend = 0;
    if (previousPeriodSentiment.length > 0 && overallSentiment.length > 0) {
      const currentAvgScore = overallSentiment[0].avgScore;
      const previousAvgScore = previousPeriodSentiment[0].avgScore;
      trend = currentAvgScore - previousAvgScore;
    }

    // Save trend data for historical tracking
    await SentimentTrend.create({
      date: new Date(),
      timeframe,
      overallSentiment: overallSentiment.length > 0 ? overallSentiment[0] : null,
      trend,
      dataPoints: sentimentTrends
    });

    res.json({
      overallSentiment: overallSentiment.length > 0 ? overallSentiment[0] : null,
      trend,
      trendDirection: trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'stable',
      trendPercentage: previousPeriodSentiment.length > 0 
        ? Math.abs(trend / Math.abs(previousPeriodSentiment[0].avgScore)) * 100 
        : 0,
      timeframe,
      sentimentTrends
    });
  } catch (err) {
    console.error('Error fetching sentiment overview:', err);
    res.status(500).json({ error: 'Failed to fetch sentiment overview data' });
  }
});

/**
 * @route   GET /api/sentiment/by-source
 * @desc    Get sentiment breakdown by data source
 * @access  Private
 */
router.get('/by-source', authenticateUser, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.timestamp = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    } else {
      // Default to last 30 days if no dates specified
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultStartDate.getDate() - 30);
      dateFilter.timestamp = { $gte: defaultStartDate };
    }

    const sentimentBySource = await SentimentData.aggregate([
      { $match: dateFilter },
      { $group: {
          _id: '$source',
          positive: { $sum: { $cond: [{ $gt: ['$score', 0.2] }, 1, 0] } },
          neutral: { 
            $sum: { 
              $cond: [
                { $and: [
                  { $gte: ['$score', -0.2] }, 
                  { $lte: ['$score', 0.2] }
                ]}, 
                1, 
                0
              ] 
            } 
          },
          negative: { $sum: { $cond: [{ $lt: ['$score', -0.2] }, 1, 0] } },
          total: { $sum: 1 },
          avgScore: { $avg: '$score' }
        }
      },
      { $project: {
          _id: 0,
          name: '$_id',
          positive: 1,
          neutral: 1,
          negative: 1,
          total: 1,
          avgScore: 1
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json(sentimentBySource);
  } catch (err) {
    console.error('Error fetching sentiment by source:', err);
    res.status(500).json({ error: 'Failed to fetch sentiment by source data' });
  }
});

/**
 * @route   GET /api/sentiment/concerns
 * @desc    Get top concerns based on topic analysis
 * @access  Private
 */
router.get('/concerns', authenticateUser, async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.timestamp = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    } else {
      // Default to last 30 days if no dates specified
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultStartDate.getDate() - 30);
      dateFilter.timestamp = { $gte: defaultStartDate };
    }

    const topConcerns = await SentimentData.aggregate([
      { $match: dateFilter },
      { $unwind: '$topics' },
      { $group: {
          _id: '$topics.term',
          count: { $sum: 1 },
          sentiment: { $avg: '$score' },
          negative: { $sum: { $cond: [{ $lt: ['$score', -0.2] }, 1, 0] } },
          positive: { $sum: { $cond: [{ $gt: ['$score', 0.2] }, 1, 0] } },
          neutral: { 
            $sum: { 
              $cond: [
                { $and: [
                  { $gte: ['$score', -0.2] }, 
                  { $lte: ['$score', 0.2] }
                ]}, 
                1, 
                0
              ] 
            } 
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
      { $project: {
          _id: 0,
          name: '$_id',
          count: 1,
          sentiment: 1,
          negative: 1,
          positive: 1,
          neutral: 1
        }
      }
    ]);

    res.json(topConcerns);
  } catch (err) {
    console.error('Error fetching top concerns:', err);
    res.status(500).json({ error: 'Failed to fetch top concerns data' });
  }
});

/**
 * @route   GET /api/sentiment/raw
 * @desc    Get raw sentiment data with pagination
 * @access  Private
 */
router.get('/raw', authenticateUser, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      startDate, 
      endDate, 
      source,
      sentiment,
      topic,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;
    
    // Build filter
    const filter = {};
    
    // Date filter
    if (startDate && endDate) {
      filter.timestamp = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }
    
    // Source filter
    if (source) {
      filter.source = source;
    }
    
    // Sentiment filter
    if (sentiment === 'positive') {
      filter.score = { $gt: 0.2 };
    } else if (sentiment === 'negative') {
      filter.score = { $lt: -0.2 };
    } else if (sentiment === 'neutral') {
      filter.score = { $gte: -0.2, $lte: 0.2 };
    }
    
    // Topic filter
    if (topic) {
      filter['topics.term'] = topic;
    }
    
    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [data, total] = await Promise.all([
      SentimentData.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      SentimentData.countDocuments(filter)
    ]);
    
    res.json({
      data,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    console.error('Error fetching raw sentiment data:', err);
    res.status(500).json({ error: 'Failed to fetch raw sentiment data' });
  }
});

/**
 * @route   POST /api/sentiment/batch
 * @desc    Upload and process a batch of sentiment data
 * @access  Private
 */
router.post('/batch', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Process uploaded CSV or JSON file
    // This would typically be handled by a background job
    // For demo purposes, we'll just respond with a success message
    
    // For a real implementation:
    // 1. Read the file (CSV or JSON)
    // 2. Parse the data
    // 3. Process each entry through sentiment analysis
    // 4. Save to database
    // 5. Return batch ID for tracking

    res.json({
      message: 'File uploaded successfully',
      batchId: 'batch_' + Date.now(),
      status: 'processing',
      fileSize: req.file.size,
      estimatedRecords: Math.floor(req.file.size / 500) // Rough estimate
    });
  } catch (err) {
    console.error('Error processing batch upload:', err);
    res.status(500).json({ error: 'Failed to process batch upload' });
  }
});

module.exports = router;