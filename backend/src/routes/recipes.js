const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const aiService = require('../services/aiService');
const auth = require('../middleware/auth');

// Get all recipes for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, tags, mealType } = req.query;
    const query = { user: req.user.id };

    // Add search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Add tag filtering
    if (tags) {
      query['metadata.tags'] = { $in: tags.split(',') };
    }

    // Add meal type filtering
    if (mealType) {
      query['metadata.mealType'] = { $in: mealType.split(',') };
    }

    const recipes = await Recipe.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email');

    const total = await Recipe.countDocuments(query);

    res.json({
      recipes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Get single recipe
router.get('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    }).populate('user', 'name email');

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Increment view count
    recipe.views += 1;
    await recipe.save();

    res.json(recipe);
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// Create recipe from URL
router.post('/from-url', auth, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Extract text from URL
    const rawText = await aiService.extractTextFromURL(url);
    
    // Get user preferences
    const user = await User.findById(req.user.id);
    
    let recipeData;
    let aiProcessingStatus = {
      isProcessed: false,
      processedAt: null,
      originalFormat: 'url',
      standardizationApplied: [],
      personalizationApplied: [],
      confidenceScore: 0,
      errors: []
    };

    try {
      // Parse recipe with AI
      const parsedRecipe = await aiService.parseRecipeFromText(rawText, user.preferences);
      
      // Standardize recipe
      const standardizedRecipe = await aiService.standardizeRecipe(parsedRecipe, user.preferences);
      
      // Personalize instructions
      const personalizedRecipe = await aiService.personalizeInstructions(
        standardizedRecipe, 
        user.preferences, 
        user.equipment
      );

      recipeData = personalizedRecipe;
      aiProcessingStatus = {
        isProcessed: true,
        processedAt: new Date(),
        originalFormat: 'url',
        standardizationApplied: ['units', 'equipment', 'terminology'],
        personalizationApplied: ['instructions', 'equipment', 'skill-level'],
        confidenceScore: 0.9,
        errors: []
      };
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      
      // Create a basic recipe from the raw text if AI fails
      recipeData = {
        title: 'Recipe from URL',
        description: 'Recipe imported from URL (AI processing failed)',
        ingredients: [],
        instructions: [
          {
            stepNumber: 1,
            instruction: 'Original recipe text: ' + rawText.substring(0, 500) + '...',
            originalText: rawText.substring(0, 500) + '...'
          }
        ],
        metadata: {
          prepTime: 'Unknown',
          cookTime: 'Unknown',
          totalTime: 'Unknown',
          servings: 'Unknown',
          difficulty: 'Unknown',
          cuisine: [],
          tags: [],
          mealType: []
        }
      };
      
      aiProcessingStatus.errors.push(aiError.message);
    }

    // Create recipe document
    const recipe = new Recipe({
      ...recipeData,
      source: {
        type: 'url',
        url: url,
        originalText: rawText
      },
      aiProcessing: aiProcessingStatus,
      user: req.user.id
    });

    await recipe.save();

    // Update user's AI learning data only if AI processing succeeded
    if (aiProcessingStatus.isProcessed) {
      user.aiLearningData.totalRecipesParsed += 1;
      await user.save();
    }

    res.status(201).json(recipe);
  } catch (error) {
    console.error('Create recipe from URL error:', error);
    res.status(500).json({ error: 'Failed to create recipe from URL' });
  }
});

// Create recipe from YouTube video
router.post('/from-youtube', auth, async (req, res) => {
  try {
    const { videoId } = req.body;
    
    if (!videoId) {
      return res.status(400).json({ error: 'YouTube video ID is required' });
    }

    // Extract transcript from YouTube
    const rawText = await aiService.extractTextFromYouTube(videoId);
    
    // Get user preferences
    const user = await User.findById(req.user.id);
    
    // Parse recipe with AI
    const parsedRecipe = await aiService.parseRecipeFromText(rawText, user.preferences);
    
    // Standardize recipe
    const standardizedRecipe = await aiService.standardizeRecipe(parsedRecipe, user.preferences);
    
    // Personalize instructions
    const personalizedRecipe = await aiService.personalizeInstructions(
      standardizedRecipe, 
      user.preferences, 
      user.equipment
    );

    // Create recipe document
    const recipe = new Recipe({
      ...personalizedRecipe,
      source: {
        type: 'video',
        platform: 'youtube',
        videoId: videoId,
        originalText: rawText
      },
      aiProcessing: {
        isProcessed: true,
        processedAt: new Date(),
        originalFormat: 'youtube-transcript',
        standardizationApplied: ['units', 'equipment', 'terminology'],
        personalizationApplied: ['instructions', 'equipment', 'skill-level'],
        confidenceScore: 0.85
      },
      user: req.user.id
    });

    await recipe.save();

    // Update user's AI learning data
    user.aiLearningData.totalRecipesParsed += 1;
    await user.save();

    res.status(201).json(recipe);
  } catch (error) {
    console.error('Create recipe from YouTube error:', error);
    res.status(500).json({ error: 'Failed to create recipe from YouTube video' });
  }
});

// Create custom recipe
router.post('/custom', auth, async (req, res) => {
  try {
    const { rawText, title } = req.body;
    
    if (!rawText) {
      return res.status(400).json({ error: 'Recipe text is required' });
    }

    // Get user preferences
    const user = await User.findById(req.user.id);
    
    // Parse recipe with AI
    const parsedRecipe = await aiService.parseRecipeFromText(rawText, user.preferences);
    
    // Override title if provided
    if (title) {
      parsedRecipe.title = title;
    }
    
    // Standardize recipe
    const standardizedRecipe = await aiService.standardizeRecipe(parsedRecipe, user.preferences);
    
    // Personalize instructions
    const personalizedRecipe = await aiService.personalizeInstructions(
      standardizedRecipe, 
      user.preferences, 
      user.equipment
    );

    // Create recipe document
    const recipe = new Recipe({
      ...personalizedRecipe,
      source: {
        type: 'manual',
        originalText: rawText
      },
      aiProcessing: {
        isProcessed: true,
        processedAt: new Date(),
        originalFormat: 'freeform-text',
        standardizationApplied: ['units', 'equipment', 'terminology'],
        personalizationApplied: ['instructions', 'equipment', 'skill-level'],
        confidenceScore: 0.8
      },
      user: req.user.id
    });

    await recipe.save();

    // Update user's AI learning data
    user.aiLearningData.totalRecipesParsed += 1;
    await user.save();

    res.status(201).json(recipe);
  } catch (error) {
    console.error('Create custom recipe error:', error);
    res.status(500).json({ error: 'Failed to create custom recipe' });
  }
});

// Update recipe
router.put('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Update recipe fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        recipe[key] = req.body[key];
      }
    });

    await recipe.save();

    // Update user's AI learning data
    const user = await User.findById(req.user.id);
    user.aiLearningData.totalRecipesEdited += 1;
    await user.save();

    res.json(recipe);
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

// Delete recipe
router.delete('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// Share recipe
router.post('/:id/share', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    recipe.isPublic = true;
    await recipe.save();

    res.json({ 
      shareUrl: `${process.env.FRONTEND_URL}/shared/${recipe.shareId}`,
      shareId: recipe.shareId 
    });
  } catch (error) {
    console.error('Share recipe error:', error);
    res.status(500).json({ error: 'Failed to share recipe' });
  }
});

// Get shared recipe (public)
router.get('/shared/:shareId', async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ 
      shareId: req.params.shareId,
      isPublic: true 
    }).populate('user', 'name');

    if (!recipe) {
      return res.status(404).json({ error: 'Shared recipe not found' });
    }

    res.json(recipe);
  } catch (error) {
    console.error('Get shared recipe error:', error);
    res.status(500).json({ error: 'Failed to fetch shared recipe' });
  }
});

module.exports = router;
