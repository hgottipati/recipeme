# Quick Google OAuth Setup

## The Error You're Seeing

The error `"Unknown authentication strategy \"google\""` occurs because Google OAuth credentials are not configured. The app is designed to work gracefully without OAuth, but you need to set up the credentials to enable Google login.

## Quick Setup (5 minutes)

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add authorized redirect URI: `http://localhost:5001/api/auth/google/callback`
7. Copy the Client ID and Client Secret

### 2. Create Backend .env File

Create a `.env` file in the `backend` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/recipe-ai

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Session Secret (for OAuth)
SESSION_SECRET=your-session-secret-key-change-this-in-production

# Google OAuth (REPLACE WITH YOUR ACTUAL VALUES)
GOOGLE_CLIENT_ID=your-actual-google-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# OpenAI API Key
OPENAI_API_KEY=your-openai-api-key-here

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Server Configuration
PORT=5001
NODE_ENV=development
```

### 3. Create Frontend .env.local File

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

### 4. Restart Servers

```bash
# Stop current servers (Ctrl+C)
# Then restart:

# Backend
cd backend
npm run dev

# Frontend (in new terminal)
cd frontend
npm run dev
```

### 5. Test Google Login

1. Go to `http://localhost:3000/login`
2. Click "Continue with Google"
3. Complete OAuth flow
4. You should be logged in!

## Current Status

✅ **App works without OAuth** - Email/password login still works  
✅ **Graceful error handling** - Shows helpful messages when OAuth not configured  
✅ **Easy setup** - Just add environment variables  
✅ **Production ready** - Handles both configured and unconfigured states  

## Troubleshooting

- **"Google OAuth not configured"** → Add the environment variables above
- **"redirect_uri_mismatch"** → Make sure redirect URI in Google Console matches exactly
- **CORS errors** → Ensure FRONTEND_URL is set correctly in backend .env

The app is now fully functional with proper error handling for both configured and unconfigured OAuth states!
