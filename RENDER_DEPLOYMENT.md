# Render Deployment Guide

## Backend Deployment on Render

### 1. Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select the repository: `hgottipati/recipeme`

### 2. Configure Service Settings

**Basic Settings:**
- **Name**: `recipe-ai-backend`
- **Environment**: `Node`
- **Branch**: `main`
- **Root Directory**: Leave empty (uses root)
- **Build Command**: `npm install`
- **Start Command**: `cd backend && npm start`

### 3. Environment Variables

Add these environment variables in Render dashboard:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipe-ai

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-for-production

# Session Secret (generate a strong random string)
SESSION_SECRET=your-super-secret-session-key-for-production

# Google OAuth (optional - only if you want Google login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-app-name.onrender.com/api/auth/google/callback

# OpenAI API Key
OPENAI_API_KEY=your-openai-api-key

# Frontend URL (update after deploying frontend)
FRONTEND_URL=https://your-frontend-url.com

# Server Configuration
PORT=10000
NODE_ENV=production
```

### 4. Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy
3. Your backend will be available at: `https://your-app-name.onrender.com`

## Frontend Deployment on Render

### 1. Create New Static Site

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Static Site"
3. Connect your GitHub repository
4. Select the repository: `hgottipati/recipeme`

### 2. Configure Static Site Settings

**Basic Settings:**
- **Name**: `recipe-ai-frontend`
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `frontend/.next`

### 3. Environment Variables

Add these environment variables:

```env
# Backend API URL (use your backend URL from step above)
NEXT_PUBLIC_API_URL=https://your-backend-app-name.onrender.com/api
```

### 4. Deploy

1. Click "Create Static Site"
2. Render will build and deploy your frontend
3. Your frontend will be available at: `https://your-frontend-name.onrender.com`

## Google OAuth Setup for Production

### 1. Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - `https://your-backend-app-name.onrender.com/api/auth/google/callback`

### 2. Update Environment Variables

Update the backend environment variables in Render:
- `GOOGLE_CALLBACK_URL=https://your-backend-app-name.onrender.com/api/auth/google/callback`
- `FRONTEND_URL=https://your-frontend-name.onrender.com`

## Troubleshooting

### Common Issues:

1. **Build fails**: Check that all dependencies are in package.json
2. **Environment variables not working**: Make sure they're set in Render dashboard
3. **CORS errors**: Ensure FRONTEND_URL matches your frontend domain
4. **Database connection fails**: Check MONGODB_URI format and credentials

### Logs:

- Check Render logs in the dashboard for detailed error messages
- Backend logs: Service → Logs tab
- Frontend logs: Static Site → Logs tab

## Cost Considerations

- **Free tier**: 750 hours/month for web services
- **Static sites**: Always free
- **Database**: Consider MongoDB Atlas free tier (512MB)

## Security Notes

- Use strong, unique secrets for JWT_SECRET and SESSION_SECRET
- Never commit .env files to git
- Use HTTPS URLs for all OAuth redirects
- Regularly rotate API keys and secrets
