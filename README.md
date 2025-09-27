# 🍳 Recipe AI - Intelligent Recipe Management

An AI-powered recipe app that standardizes messy, unstructured recipes from any source (YouTube, websites, reels, etc.), adapts cooking instructions to the user's preferred style and equipment, and evolves with the user's cooking habits over time.

## ✨ Features

### Core Functionality
- **📱 Add Recipe from URL or Video** - Parse recipes from YouTube, AllRecipes, NYT Cooking, Instagram, and more
- **🤖 AI Standardization Engine** - Converts units, normalizes equipment names, and standardizes terminology
- **👤 Personalized Instructions** - Adapts recipes to your equipment, skill level, and cooking preferences
- **✍️ Custom Recipe Entry** - Enter recipes in freeform text and let AI structure them
- **👥 Recipe Sharing** - Share standardized recipes with clean formatting

### AI-Powered Features
- **🧠 Smart Parsing** - Extracts ingredients, instructions, and metadata from any source
- **📏 Unit Conversion** - Converts measurements to your preferred units (metric/imperial)
- **🔧 Equipment Adaptation** - Replaces equipment names with your available tools
- **📚 Learning Loop** - Gets smarter with every recipe you cook and edit
- **🎯 Personalization** - Adapts instructions to your skill level and cooking style

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **OpenAI GPT-4** - AI recipe parsing and standardization
- **JWT** - Authentication
- **Cheerio** - Web scraping
- **YouTube Transcript** - Video content extraction

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- OpenAI API key

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RecipeAi
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cd backend
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Configure environment variables**
   ```bash
   # backend/.env
   MONGODB_URI=mongodb://localhost:27017/recipe-ai
   JWT_SECRET=your-super-secret-jwt-key
   OPENAI_API_KEY=your-openai-api-key
   FRONTEND_URL=http://localhost:3000
   PORT=5000
   ```

5. **Start the development servers**
   ```bash
   # From project root
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 🔧 Configuration

### OpenAI API Setup
1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add it to your `.env` file as `OPENAI_API_KEY`
3. Ensure you have credits in your OpenAI account

### MongoDB Setup
- **Local**: Install MongoDB locally and use `mongodb://localhost:27017/recipe-ai`
- **Cloud**: Use MongoDB Atlas and update `MONGODB_URI` in `.env`

## 📱 Usage

### Adding Recipes

1. **From URL**
   - Paste any recipe URL from supported sites
   - AI extracts and structures the content automatically

2. **From YouTube**
   - Enter YouTube video ID or URL
   - AI extracts transcript and parses recipe

3. **Custom Text**
   - Paste recipe in any format
   - AI structures ingredients, instructions, and metadata

### Personalization

1. **Set Preferences**
   - Measurement units (metric/imperial)
   - Dietary restrictions
   - Preferred cooking methods
   - Skill level

2. **Add Equipment**
   - List your available kitchen equipment
   - AI adapts instructions accordingly

3. **AI Learning**
   - Rate AI suggestions
   - Edit recipes to improve future parsing
   - System learns your preferences over time

## 🏗️ Project Structure

```
RecipeAi/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   └── lib/            # Utilities and API
│   └── package.json
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   └── config/         # Configuration
│   └── package.json
└── package.json            # Root package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile

### Recipes
- `GET /api/recipes` - Get user's recipes
- `POST /api/recipes/from-url` - Create recipe from URL
- `POST /api/recipes/from-youtube` - Create recipe from YouTube
- `POST /api/recipes/custom` - Create custom recipe
- `GET /api/recipes/:id` - Get single recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

### AI Services
- `POST /api/ai/parse` - Parse text with AI
- `POST /api/ai/standardize` - Standardize recipe
- `POST /api/ai/personalize` - Personalize recipe

## 🧪 Development

### Running Tests
```bash
cd backend
npm test
```

### Building for Production
```bash
npm run build
```

### Environment Variables
- `NODE_ENV` - Environment (development/production)
- `PORT` - Backend port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `OPENAI_API_KEY` - OpenAI API key
- `FRONTEND_URL` - Frontend URL for CORS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include error logs and steps to reproduce

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Basic recipe parsing from URLs
- ✅ AI standardization engine
- ✅ User preferences and equipment
- ✅ Recipe CRUD operations

### Phase 2 (Next)
- 🔄 Advanced AI learning loop
- 🔄 Recipe sharing and export
- 🔄 Mobile app (React Native)
- 🔄 Offline support

### Phase 3 (Future)
- 📋 Meal planning integration
- 🛒 Grocery list generation
- 📊 Nutrition analysis
- 🌐 Multi-language support

---

**Built with ❤️ by the Recipe AI Team**
# Vercel deployment trigger
