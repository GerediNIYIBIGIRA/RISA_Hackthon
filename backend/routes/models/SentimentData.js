// models/SentimentData.js - Schema for sentiment data

const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  term: {
    type: String,
    required: true,
    index: true
  },
  weight: {
    type: Number,
    required: true
  }
}, { _id: false });

const entitySchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  }
}, { _id: false });

const sentimentDataSchema = new mongoose.Schema({
  originalText: {
    type: String,
    required: true
  },
  processedText: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true,
    index: true,
    enum: ['Twitter', 'Facebook', 'News Comments', 'Forums', 'Surveys', 'Official Feedback', 'Other']
  },
  timestamp: {
    type: Date,
    required: true,
    index: true,
    default: Date.now
  },
  language: {
    type: String,
    required: true,
    enum: ['en', 'fr', 'rw']
  },
  score: {
    type: Number,
    required: true,
    index: true
  },
  sentiment: {
    type: String,
    required: true,
    enum: ['positive', 'neutral', 'negative'],
    index: true
  },
  confidence: {
    type: Number,
    required: true
  },
  topics: {
    type: [topicSchema],
    default: []
  },
  entities: {
    type: [entitySchema],
    default: []
  },
  metadata: {
    language: {
      detected: {
        type: String,
        enum: ['en', 'fr', 'rw', 'other']
      },
      confidence: Number
    },
    location: {
      province: String,
      district: String,
      sector: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    demographic: {
      type: String,
      enum: ['Urban Residents', 'Rural Residents', 'Students', 'Working Adults', 'Elderly', 'Unspecified'],
      default: 'Unspecified'
    },
    engagement: {
      likes: Number,
      comments: Number,
      shares: Number
    },
    author: {
      id: String,
      verified: Boolean,
      followers: Number
    },
    device: String,
    postId: String,
    url: String
  },
  potentialMisinformation: {
    type: Boolean,
    default: false,
    index: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: []
  },
  batchId: {
    type: String,
    index: true
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'pending'
  },
  processingError: String,
  processedAt: Date
}, { 
  timestamps: true, 
  collection: 'sentiment_data' 
});

// Create compound indexes for efficient querying
sentimentDataSchema.index({ source: 1, timestamp: -1 });
sentimentDataSchema.index({ sentiment: 1, timestamp: -1 });
sentimentDataSchema.index({ 'metadata.demographic': 1, sentiment: 1 });
sentimentDataSchema.index({ 'metadata.location.province': 1, 'metadata.location.district': 1 });
sentimentDataSchema.index({ 'topics.term': 1, score: 1 });

// Virtual for sentiment text representation
sentimentDataSchema.virtual('sentimentText').get(function() {
  if (this.score > 0.2) return 'Positive';
  if (this.score < -0.2) return 'Negative';
  return 'Neutral';
});

// Method to get similar entries
sentimentDataSchema.methods.getSimilar = async function(limit = 5) {
  const topics = this.topics.map(t => t.term);
  
  return this.model('SentimentData').find({
    _id: { $ne: this._id },
    'topics.term': { $in: topics }
  })
  .sort({ timestamp: -1 })
  .limit(limit);
};

// Static to get trending topics
sentimentDataSchema.statics.getTrendingTopics = async function(days = 7, limit = 10) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { 
      $match: { 
        timestamp: { $gte: startDate } 
      } 
    },
    { $unwind: '$topics' },
    { 
      $group: {
        _id: '$topics.term',
        count: { $sum: 1 },
        avgSentiment: { $avg: '$score' },
        documents: { $push: { id: '$_id', score: '$score' } }
      } 
    },
    { $sort: { count: -1 } },
    { $limit: limit },
    { 
      $project: {
        _id: 0,
        topic: '$_id',
        count: 1,
        avgSentiment: 1,
        documents: { $slice: ['$documents', 5] }
      } 
    }
  ]);
};

// Pre-save middleware to set sentiment based on score
sentimentDataSchema.pre('save', function(next) {
  if (this.score > 0.2) {
    this.sentiment = 'positive';
  } else if (this.score < -0.2) {
    this.sentiment = 'negative';
  } else {
    this.sentiment = 'neutral';
  }
  
  if (!this.processedAt && this.processingStatus === 'processed') {
    this.processedAt = new Date();
  }
  
  next();
});

const SentimentData = mongoose.model('SentimentData', sentimentDataSchema);

module.exports = SentimentData;