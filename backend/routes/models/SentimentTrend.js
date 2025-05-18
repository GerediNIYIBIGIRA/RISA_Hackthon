// models/SentimentTrend.js - Schema for tracking sentiment trends over time

const mongoose = require('mongoose');

const dataPointSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  positive: {
    type: Number,
    required: true
  },
  neutral: {
    type: Number,
    required: true
  },
  negative: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  positivePercent: {
    type: Number,
    required: true
  },
  neutralPercent: {
    type: Number,
    required: true
  },
  negativePercent: {
    type: Number,
    required: true
  }
}, { _id: false });

const overallSentimentSchema = new mongoose.Schema({
  positive: {
    type: Number,
    required: true
  },
  neutral: {
    type: Number,
    required: true
  },
  negative: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  avgScore: {
    type: Number,
    required: true
  },
  positivePercent: {
    type: Number,
    required: true
  },
  neutralPercent: {
    type: Number,
    required: true
  },
  negativePercent: {
    type: Number,
    required: true
  }
}, { _id: false });

const sentimentTrendSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true,
    default: Date.now
  },
  timeframe: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  overallSentiment: {
    type: overallSentimentSchema,
    required: false
  },
  trend: {
    type: Number,
    required: true,
    default: 0
  },
  dataPoints: {
    type: [dataPointSchema],
    default: []
  },
  notes: {
    type: String
  },
  tags: {
    type: [String],
    default: []
  },
  generatedBy: {
    type: String,
    default: 'system'
  }
}, { 
  timestamps: true, 
  collection: 'sentiment_trends' 
});

// Virtual for trend direction
sentimentTrendSchema.virtual('trendDirection').get(function() {
  if (this.trend > 0.05) return 'positive';
  if (this.trend < -0.05) return 'negative';
  return 'stable';
});

// Static to get latest trend
sentimentTrendSchema.statics.getLatestTrend = async function(timeframe = 'daily') {
  return this.findOne({ timeframe })
    .sort({ date: -1 })
    .limit(1);
};

// Static to get trends for a period
sentimentTrendSchema.statics.getTrendsForPeriod = async function(startDate, endDate, timeframe = 'daily') {
  return this.find({
    timeframe,
    date: { $gte: startDate, $lte: endDate }
  })
  .sort({ date: 1 });
};

// Static to compare two time periods
sentimentTrendSchema.statics.comparePeriods = async function(period1Start, period1End, period2Start, period2End, timeframe = 'daily') {
  const [period1Data, period2Data] = await Promise.all([
    this.aggregate([
      { 
        $match: { 
          timeframe,
          date: { $gte: new Date(period1Start), $lte: new Date(period1End) }
        }
      },
      {
        $group: {
          _id: null,
          avgSentiment: { $avg: '$overallSentiment.avgScore' },
          positivePercent: { $avg: '$overallSentiment.positivePercent' },
          neutralPercent: { $avg: '$overallSentiment.neutralPercent' },
          negativePercent: { $avg: '$overallSentiment.negativePercent' },
          totalRecords: { $sum: '$overallSentiment.total' }
        }
      }
    ]),
    this.aggregate([
      { 
        $match: { 
          timeframe,
          date: { $gte: new Date(period2Start), $lte: new Date(period2End) }
        }
      },
      {
        $group: {
          _id: null,
          avgSentiment: { $avg: '$overallSentiment.avgScore' },
          positivePercent: { $avg: '$overallSentiment.positivePercent' },
          neutralPercent: { $avg: '$overallSentiment.neutralPercent' },
          negativePercent: { $avg: '$overallSentiment.negativePercent' },
          totalRecords: { $sum: '$overallSentiment.total' }
        }
      }
    ])
  ]);

  // Calculate differences
  const period1 = period1Data.length > 0 ? period1Data[0] : null;
  const period2 = period2Data.length > 0 ? period2Data[0] : null;
  
  if (!period1 || !period2) {
    return { error: 'Insufficient data for comparison' };
  }
  
  return {
    period1: {
      startDate: period1Start,
      endDate: period1End,
      data: period1
    },
    period2: {
      startDate: period2Start,
      endDate: period2End,
      data: period2
    },
    differences: {
      avgSentiment: period2.avgSentiment - period1.avgSentiment,
      positivePercent: period2.positivePercent - period1.positivePercent,
      neutralPercent: period2.neutralPercent - period1.neutralPercent,
      negativePercent: period2.negativePercent - period1.negativePercent,
      totalRecords: period2.totalRecords - period1.totalRecords
    }
  };
};

const SentimentTrend = mongoose.model('SentimentTrend', sentimentTrendSchema);

module.exports = SentimentTrend;