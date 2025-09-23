# Social Login Setup Guide

This guide will help you set up Google OAuth authentication for your RecipeAi application.

## Prerequisites

- Google Cloud Console account
- MongoDB database running
- Backend and frontend servers running

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

### 2. Configure OAuth Consent Screen

1. Navigate to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace)
3. Fill in the required fields:
   - App name: "RecipeAi"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes: `../auth/userinfo.email` and `../auth/userinfo.profile`
5. Add test users (for development)

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - For development: `http://localhost:5001/api/auth/google/callback`
   - For production: `https://yourdomain.com/api/auth/google/callback`
5. Save and note down the Client ID and Client Secret

## Environment Configuration

### Backend (.env)

Create a `.env` file in the backend directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/recipe-ai

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Session Secret (for OAuth)
SESSION_SECRET=your-session-secret-key-change-this-in-production

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-from-step-3
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-step-3
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# OpenAI API Key
OPENAI_API_KEY=your-openai-api-key-here

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Server Configuration
PORT=5001
NODE_ENV=development
```

### Frontend (.env.local)

Create a `.env.local` file in the frontend directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

## Testing the Setup

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to `http://localhost:3000/login`
4. Click "Continue with Google"
5. Complete the OAuth flow
6. You should be redirected back to the app and logged in

## Features Added

- ✅ Google OAuth authentication
- ✅ User model updated with social login fields
- ✅ Automatic account linking (if email matches existing account)
- ✅ Profile picture support from Google
- ✅ Seamless integration with existing authentication system

## Security Notes

- Never commit your `.env` files to version control
- Use strong, unique secrets for JWT_SECRET and SESSION_SECRET
- In production, use HTTPS for all OAuth redirects
- Regularly rotate your OAuth credentials

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch"**: Ensure the redirect URI in Google Console matches exactly
2. **"invalid_client"**: Check that your Client ID and Secret are correct
3. **CORS errors**: Make sure FRONTEND_URL is set correctly in backend .env
4. **Session issues**: Ensure SESSION_SECRET is set and consistent

### Debug Mode

To enable debug logging, set `NODE_ENV=development` in your backend .env file.

## Next Steps

- Add Facebook OAuth (similar process)
- Add GitHub OAuth
- Implement account linking/unlinking
- Add profile picture display in the UI
