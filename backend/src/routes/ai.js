const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const auth = require('../middleware/auth');

// Parse text with AI
router.post('/parse', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    const parsedRecipe = await aiService.parseRecipeFromText(text, user.preferences);
    
    res.json(parsedRecipe);
  } catch (error) {
    console.error('AI parse error:', error);
    res.status(500).json({ error: 'Failed to parse text with AI' });
  }
});

// Standardize recipe
router.post('/standardize', auth, async (req, res) => {
  try {
    const { recipe } = req.body;
    
    if (!recipe) {
      return res.status(400).json({ error: 'Recipe is required' });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    const standardizedRecipe = await aiService.standardizeRecipe(recipe, user.preferences);
    
    res.json(standardizedRecipe);
  } catch (error) {
    console.error('AI standardize error:', error);
    res.status(500).json({ error: 'Failed to standardize recipe with AI' });
  }
});

// Personalize recipe
router.post('/personalize', auth, async (req, res) => {
  try {
    const { recipe } = req.body;
    
    if (!recipe) {
      return res.status(400).json({ error: 'Recipe is required' });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    const personalizedRecipe = await aiService.personalizeInstructions(
      recipe, 
      user.preferences, 
      user.equipment
    );
    
    res.json(personalizedRecipe);
  } catch (error) {
    console.error('AI personalize error:', error);
    res.status(500).json({ error: 'Failed to personalize recipe with AI' });
  }
});

// Extract content from URL
router.post('/extract-url', auth, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const extractedText = await aiService.extractTextFromURL(url);
    
    res.json({ extractedText });
  } catch (error) {
    console.error('URL extraction error:', error);
    res.status(500).json({ error: 'Failed to extract content from URL' });
  }
});

// Extract transcript from YouTube
router.post('/extract-youtube', auth, async (req, res) => {
  try {
    const { videoId } = req.body;
    
    if (!videoId) {
      return res.status(400).json({ error: 'YouTube video ID is required' });
    }

    const extractedText = await aiService.extractTextFromYouTube(videoId);
    
    res.json({ extractedText });
  } catch (error) {
    console.error('YouTube extraction error:', error);
    res.status(500).json({ error: 'Failed to extract transcript from YouTube video' });
  }
});

module.exports = router;
