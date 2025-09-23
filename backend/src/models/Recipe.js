const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: String, required: true },
  unit: { type: String, required: true },
  notes: String,
  originalText: String // Store original ingredient text for reference
});

const instructionSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  instruction: { type: String, required: true },
  time: String,
  temperature: String,
  equipment: [String],
  tips: [String],
  originalText: String // Store original instruction text
});

const nutritionSchema = new mongoose.Schema({
  calories: Number,
  protein: String,
  carbs: String,
  fat: String,
  fiber: String,
  sugar: String,
  sodium: String
});

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  source: {
    type: {
      type: String,
      enum: ['url', 'video', 'manual', 'custom'],
      required: true
    },
    url: String,
    platform: String,
    videoId: String,
    originalText: String
  },
  ingredients: [ingredientSchema],
  instructions: [instructionSchema],
  metadata: {
    prepTime: String,
    cookTime: String,
    totalTime: String,
    servings: Number,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    cuisine: [String],
    tags: [String],
    mealType: [{
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer']
    }]
  },
  nutrition: nutritionSchema,
  images: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  aiProcessing: {
    isProcessed: { type: Boolean, default: false },
    processedAt: Date,
    originalFormat: String,
    standardizationApplied: [String],
    personalizationApplied: [String],
    confidenceScore: Number
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: { type: Boolean, default: false },
  shareId: String, // Unique ID for sharing
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
recipeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Generate share ID before saving if not present
recipeSchema.pre('save', function(next) {
  if (this.isPublic && !this.shareId) {
    this.shareId = require('crypto').randomBytes(8).toString('hex');
  }
  next();
});

// Index for search functionality
recipeSchema.index({ title: 'text', description: 'text', 'metadata.tags': 'text' });
recipeSchema.index({ user: 1, createdAt: -1 });
recipeSchema.index({ shareId: 1 });

module.exports = mongoose.model('Recipe', recipeSchema);
