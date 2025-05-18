// models/User.js - Schema for system users

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['admin', 'data_analyst', 'policy_maker', 'viewer'],
    default: 'viewer',
    required: true
  },
  department: {
    type: String,
    enum: ['transport', 'communications', 'policy', 'technology', 'research', 'administration'],
    default: 'transport'
  },
  permissions: {
    type: [String],
    default: ['dashboard_access']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tokens: {
    type: [String],
    default: []
  },
  resetToken: {
    type: String
  },
  resetTokenExpiry: {
    type: Date
  },
  lastLogin: {
    type: Date
  },
  loginCount: {
    type: Number,
    default: 0
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lastPasswordChange: {
    type: Date
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    dashboardLayout: {
      type: String,
      default: 'default'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      browser: {
        type: Boolean,
        default: true
      },
      alertTypes: {
        type: [String],
        default: ['misinformation', 'high_severity']
      }
    },
    defaultTimeframe: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'monthly'
    }
  },
  metadata: {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, { 
  timestamps: true,
  collection: 'users'
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Method to check if user has specific permission
userSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission) || 
         (this.role === 'admin'); // Admins have all permissions
};

// Method to check if user has specific role
userSchema.methods.hasRole = function(requiredRole) {
  if (this.role === 'admin') return true; // Admins can do everything
  
  const roleHierarchy = {
    'admin': 4,
    'data_analyst': 3,
    'policy_maker': 2,
    'viewer': 1
  };
  
  return roleHierarchy[this.role] >= roleHierarchy[requiredRole];
};

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  const user = this;
  
  // Only hash the password if it's modified or new
  if (!user.isModified('password')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash password
    const hash = await bcrypt.hash(user.password, salt);
    
    // Replace plaintext password with hash
    user.password = hash;
    
    // Update lastPasswordChange if this is a password change
    if (user.isModified('password')) {
      user.lastPasswordChange = new Date();
    }
    
    next();
  } catch (err) {
    next(err);
  }
});

// Static method to find admin users
userSchema.statics.findAdmins = function() {
  return this.find({ role: 'admin' });
};

// Static method to find users by permission
userSchema.statics.findByPermission = function(permission) {
  return this.find({ permissions: permission });
};

const User = mongoose.model('User', userSchema);

module.exports = User;