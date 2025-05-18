// routes/alerts.js - Routes for system alerts and issue detection

const express = require('express');
const router = express.Router();
const { authenticateUser, requireDataAnalyst } = require('../middleware/auth');
const Alert = require('../models/Alert');
const SentimentData = require('../models/SentimentData');

/**
 * @route   GET /api/alerts
 * @desc    Get all alerts with optional filtering
 * @access  Private
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { 
      severity, 
      type, 
      status = 'active', 
      startDate, 
      endDate,
      limit = 20,
      page = 1
    } = req.query;
    
    // Build filter
    const filter = {};
    
    // Status filter
    if (status) {
      filter.status = status;
    }
    
    // Severity filter
    if (severity) {
      filter.severity = severity;
    }
    
    // Type filter
    if (type) {
      filter.type = type;
    }
    
    // Date filter
    if (startDate && endDate) {
      filter.createdAt = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [alerts, total] = await Promise.all([
      Alert.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('relatedData', 'originalText source timestamp score')
        .lean(),
      Alert.countDocuments(filter)
    ]);
    
    res.json({
      data: alerts,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

/**
 * @route   GET /api/alerts/:id
 * @desc    Get a single alert by ID
 * @access  Private
 */
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('relatedData', 'originalText source timestamp score sentiment topics')
      .populate('createdBy', 'name email')
      .populate('resolvedBy', 'name email');
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.json(alert);
  } catch (err) {
    console.error('Error fetching alert:', err);
    res.status(500).json({ error: 'Failed to fetch alert details' });
  }
});

/**
 * @route   POST /api/alerts
 * @desc    Create a new alert manually
 * @access  Private (Data Analyst)
 */
router.post('/', authenticateUser, requireDataAnalyst, async (req, res) => {
  try {
    const { 
      type, 
      content, 
      severity, 
      suggestedResponse, 
      sources,
      relatedData,
      keywords
    } = req.body;
    
    if (!type || !content) {
      return res.status(400).json({ error: 'Type and content are required' });
    }
    
    const newAlert = new Alert({
      type,
      content,
      severity: severity || 'medium',
      suggestedResponse,
      sources,
      relatedData,
      keywords,
      createdBy: req.user._id,
      createdAt: new Date(),
      status: 'active'
    });
    
    await newAlert.save();
    
    res.status(201).json(newAlert);
  } catch (err) {
    console.error('Error creating alert:', err);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

/**
 * @route   POST /api/alerts/:id/resolve
 * @desc    Mark an alert as resolved
 * @access  Private
 */
router.post('/:id/resolve', authenticateUser, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    if (alert.status === 'resolved') {
      return res.status(400).json({ error: 'Alert is already resolved' });
    }
    
    alert.status = 'resolved';
    alert.resolvedBy = req.user._id;
    alert.resolvedAt = new Date();
    alert.resolutionNotes = req.body.notes || '';
    
    await alert.save();
    
    res.json({ message: 'Alert resolved successfully', alert });
  } catch (err) {
    console.error('Error resolving alert:', err);
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

/**
 * @route   POST /api/alerts/:id/respond
 * @desc    Add a response to an alert (especially for misinformation)
 * @access  Private
 */
router.post('/:id/respond', authenticateUser, async (req, res) => {
  try {
    const { response } = req.body;
    
    if (!response) {
      return res.status(400).json({ error: 'Response content is required' });
    }
    
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    alert.response = {
      content: response,
      createdBy: req.user._id,
      createdAt: new Date()
    };
    
    alert.hasResponse = true;
    
    await alert.save();
    
    res.json({ message: 'Response added successfully', alert });
  } catch (err) {
    console.error('Error adding response to alert:', err);
    res.status(500).json({ error: 'Failed to add response' });
  }
});

/**
 * @route   GET /api/alerts/stats
 * @desc    Get alerts statistics
 * @access  Private
 */
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const [byType, bySeverity, byStatus, recent] = await Promise.all([
      // Count by type
      Alert.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $project: { type: '$_id', count: 1, _id: 0 } }
      ]),
      
      // Count by severity
      Alert.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $project: { severity: '$_id', count: 1, _id: 0 } }
      ]),
      
      // Count by status
      Alert.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } }
      ]),
      
      // Most recent alerts
      Alert.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('type content severity createdAt status')
        .lean()
    ]);
    
    res.json({
      byType,
      bySeverity,
      byStatus,
      recent,
      total: await Alert.countDocuments(),
      active: await Alert.countDocuments({ status: 'active' })
    });
  } catch (err) {
    console.error('Error fetching alert stats:', err);
    res.status(500).json({ error: 'Failed to fetch alert statistics' });
  }
});

/**
 * @route   POST /api/alerts/scan
 * @desc    Manually trigger a scan for new alerts
 * @access  Private (Data Analyst)
 */
router.post('/scan', authenticateUser, requireDataAnalyst, async (req, res) => {
  try {
    // In a real implementation, this would trigger a background job
    // to scan for misinformation and emerging concerns
    
    // For demo purposes, we'll just respond with a success message
    res.json({ 
      message: 'Alert scan initiated',
      estimatedTime: '2 minutes'
    });
  } catch (err) {
    console.error('Error initiating alert scan:', err);
    res.status(500).json({ error: 'Failed to initiate alert scan' });
  }
});

module.exports = router;