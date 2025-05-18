// models/Alert.js - Schema for system alerts

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const responseSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const alertSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['misinformation', 'emerging_concern', 'sentiment_spike'],
    index: true
  },
  content: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'resolved', 'dismissed'],
    default: 'active',
    index: true
  },
  sources: {
    type: [String],
    default: []
  },
  keywords: {
    type: [String],
    default: []
  },
  suggestedResponse: {
    type: String
  },
  response: {
    type: responseSchema
  },
  hasResponse: {
    type: Boolean,
    default: false,
    index: true
  },
  relatedData: [{
    type: Schema.Types.ObjectId,
    ref: 'SentimentData'
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  resolutionNotes: {
    type: String
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  priority: {
    type: Number,
    default: 0
  },
  confirmationCount: {
    type: Number,
    default: 1
  },
  category: {
    type: String,
    enum: ['pricing', 'service', 'technology', 'policy', 'safety', 'other'],
    default: 'other'
  },
  tags: {
    type: [String],
    default: []
  }
}, { 
  timestamps: true,
  collection: 'alerts'
});

// Create compound indexes
alertSchema.index({ type: 1, status: 1 });
alertSchema.index({ severity: 1, createdAt: -1 });
alertSchema.index({ type: 1, severity: 1, status: 1 });

// Pre-save middleware to update lastUpdated
alertSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Static method to find active alerts by type
alertSchema.statics.findActiveByType = function(type) {
  return this.find({
    type,
    status: 'active'
  }).sort({ severity: -1, createdAt: -1 });
};

// Static method to find high priority alerts
alertSchema.statics.findHighPriority = function() {
  return this.find({
    status: 'active',
    $or: [
      { severity: 'high' },
      { priority: { $gte: 7 } }
    ]
  }).sort({ severity: -1, priority: -1, createdAt: -1 });
};

// Static method to get alert statistics
alertSchema.statics.getStats = async function() {
  return this.aggregate([
    {
      $facet: {
        // Count by type
        byType: [
          { $group: { _id: '$type', count: { $sum: 1 } } },
          { $project: { type: '$_id', count: 1, _id: 0 } }
        ],
        // Count by severity
        bySeverity: [
          { $group: { _id: '$severity', count: { $sum: 1 } } },
          { $project: { severity: '$_id', count: 1, _id: 0 } }
        ],
        // Count by status
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $project: { status: '$_id', count: 1, _id: 0 } }
        ],
        // Resolution time stats
        resolutionTimes: [
          { $match: { status: 'resolved', resolvedAt: { $exists: true } } },
          {
            $project: {
              resolutionTime: { $subtract: ['$resolvedAt', '$createdAt'] }
            }
          },
          {
            $group: {
              _id: null,
              avgResolutionTimeMs: { $avg: '$resolutionTime' },
              minResolutionTimeMs: { $min: '$resolutionTime' },
              maxResolutionTimeMs: { $max: '$resolutionTime' }
            }
          },
          {
            $project: {
              _id: 0,
              avgResolutionTimeHours: { $divide: ['$avgResolutionTimeMs', 3600000] },
              minResolutionTimeHours: { $divide: ['$minResolutionTimeMs', 3600000] },
              maxResolutionTimeHours: { $divide: ['$maxResolutionTimeMs', 3600000] }
            }
          }
        ],
        // Overall counts
        counts: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
              resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
              dismissed: { $sum: { $cond: [{ $eq: ['$status', 'dismissed'] }, 1, 0] } },
              highSeverity: { $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] } },
              withResponse: { $sum: { $cond: ['$hasResponse', 1, 0] } }
            }
          },
          { $project: { _id: 0 } }
        ],
        // Alerts by time (last 30 days)
        byTime: [
          {
            $match: {
              createdAt: {
                $gte: { $subtract: [new Date(), 30 * 24 * 60 * 60 * 1000] }
              }
            }
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id': 1 } },
          { $project: { date: '$_id', count: 1, _id: 0 } }
        ],
        // Category distribution
        byCategory: [
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $project: { category: '$_id', count: 1, _id: 0 } },
          { $sort: { count: -1 } }
        ]
      }
    }
  ]);
};

// Static method to detect similar existing alerts
alertSchema.statics.findSimilar = async function(content, keywords = [], limit = 5) {
  // For a production system, this would use more sophisticated matching
  // For this demo, we'll use a simple keyword-based approach
  
  if (!keywords || keywords.length === 0) {
    // Extract potential keywords from content
    keywords = content
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 4)
      .slice(0, 5);
  }
  
  return this.find({
    $or: [
      { content: { $regex: keywords.join('|'), $options: 'i' } },
      { keywords: { $in: keywords } }
    ],
    status: 'active'
  })
  .limit(limit)
  .sort({ createdAt: -1 });
};

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;