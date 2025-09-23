const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;

    // Validation
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email,
      name,
      password
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        preferences: user.preferences,
        equipment: user.equipment
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Update last active
    await user.updateLastActive();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        preferences: user.preferences,
        equipment: user.equipment,
        aiLearningData: user.aiLearningData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update preferences
    if (req.body.preferences) {
      user.preferences = { ...user.preferences, ...req.body.preferences };
    }

    await user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Add equipment
router.post('/equipment', auth, async (req, res) => {
  try {
    const { name, type, brand, model } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const user = await User.findById(req.user.id);
    
    // Check if equipment already exists
    const existingEquipment = user.equipment.find(eq => 
      eq.name.toLowerCase() === name.toLowerCase()
    );

    if (existingEquipment) {
      return res.status(400).json({ error: 'Equipment already exists' });
    }

    user.equipment.push({ name, type, brand, model });
    await user.save();

    res.json({
      message: 'Equipment added successfully',
      equipment: user.equipment
    });
  } catch (error) {
    console.error('Add equipment error:', error);
    res.status(500).json({ error: 'Failed to add equipment' });
  }
});

// Remove equipment
router.delete('/equipment/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.equipment = user.equipment.filter(eq => eq._id.toString() !== req.params.id);
    await user.save();

    res.json({
      message: 'Equipment removed successfully',
      equipment: user.equipment
    });
  } catch (error) {
    console.error('Remove equipment error:', error);
    res.status(500).json({ error: 'Failed to remove equipment' });
  }
});

// Provide feedback on AI suggestions
router.post('/feedback', auth, async (req, res) => {
  try {
    const { recipeId, feedback } = req.body;

    if (!recipeId || !feedback) {
      return res.status(400).json({ error: 'Recipe ID and feedback are required' });
    }

    const user = await User.findById(req.user.id);
    
    user.aiLearningData.feedbackHistory.push({
      recipeId,
      feedback,
      timestamp: new Date()
    });

    await user.save();

    res.json({ message: 'Feedback recorded successfully' });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
});

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const Recipe = require('../models/Recipe');
    
    const totalRecipes = await Recipe.countDocuments({ user: req.user.id });
    const publicRecipes = await Recipe.countDocuments({ 
      user: req.user.id, 
      isPublic: true 
    });

    res.json({
      totalRecipes,
      publicRecipes,
      aiLearningData: user.aiLearningData,
      preferences: user.preferences,
      equipmentCount: user.equipment.length
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
