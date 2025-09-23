const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.facebookId; // Password required only if not social login
    },
    minlength: 6
  },
  // Social login fields
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows null values but ensures uniqueness when present
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true
  },
  avatar: {
    type: String,
    default: null
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },
  preferences: {
    measurementUnits: {
      type: String,
      enum: ['metric', 'imperial', 'mixed'],
      default: 'imperial'
    },
    dietaryRestrictions: [{
      type: String,
      enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'keto', 'paleo']
    }],
    preferredCookingMethods: [{
      type: String,
      enum: ['stovetop', 'oven', 'microwave', 'instant-pot', 'air-fryer', 'slow-cooker', 'grill']
    }],
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    preferredIngredients: [String],
    dislikedIngredients: [String],
    commonSubstitutions: {
      type: Map,
      of: String
    }
  },
  equipment: [{
    name: String,
    type: {
      type: String,
      enum: ['appliance', 'tool', 'utensil']
    },
    brand: String,
    model: String
  }],
  aiLearningData: {
    totalRecipesParsed: { type: Number, default: 0 },
    totalRecipesEdited: { type: Number, default: 0 },
    preferredInstructionsStyle: {
      type: String,
      enum: ['simple', 'detailed', 'professional'],
      default: 'detailed'
    },
    feedbackHistory: [{
      recipeId: mongoose.Schema.Types.ObjectId,
      feedback: {
        type: String,
        enum: ['thumbs-up', 'thumbs-down', 'neutral']
      },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update last active timestamp
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
