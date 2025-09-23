const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Google OAuth routes (only if credentials are configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
      try {
        // Generate JWT token
        const token = jwt.sign(
          { userId: req.user._id },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '7d' }
        );

        // Update last active
        await req.user.updateLastActive();

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}&success=true`);
      } catch (error) {
        console.error('OAuth callback error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/login?error=oauth_failed`);
      }
    }
  );
} else {
  // Return error if Google OAuth is not configured
  router.get('/google', (req, res) => {
    res.status(400).json({ 
      error: 'Google OAuth not configured',
      message: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables'
    });
  });

  router.get('/google/callback', (req, res) => {
    res.status(400).json({ 
      error: 'Google OAuth not configured',
      message: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables'
    });
  });
}

// Get current user from JWT token (for frontend)
router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      avatar: req.user.avatar,
      provider: req.user.provider,
      preferences: req.user.preferences,
      equipment: req.user.equipment,
      aiLearningData: req.user.aiLearningData
    }
  });
});

// Logout (for session-based auth, though we're using JWT)
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;
