'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search, 
  BookOpen, 
  Sparkles, 
  Globe, 
  Video, 
  FileText,
  ChefHat,
  Clock,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { recipeApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface Recipe {
  _id: string
  title: string
  description?: string
  metadata: {
    prepTime: string
    cookTime: string
    servings: number
    difficulty: string
    tags: string[]
  }
  images: Array<{ url: string; isPrimary: boolean }>
  createdAt: string
}

export default function HomePage() {
  const { user, loading } = useAuth()
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([])
  const [stats, setStats] = useState({
    totalRecipes: 0,
    aiProcessed: 0,
    sharedRecipes: 0
  })

  useEffect(() => {
    if (user) {
      fetchRecentRecipes()
      fetchStats()
    }
  }, [user])

  const fetchRecentRecipes = async () => {
    try {
      const response = await recipeApi.getRecipes({ limit: 6 })
      setRecentRecipes(response.data.recipes)
    } catch (error) {
      console.error('Failed to fetch recent recipes:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await recipeApi.getRecipes()
      const recipes = response.data.recipes
      setStats({
        totalRecipes: recipes.length,
        aiProcessed: recipes.filter(r => r.aiProcessing?.isProcessed).length,
        sharedRecipes: recipes.filter(r => r.isPublic).length
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <LandingPage />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <ChefHat className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gradient">Recipe AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user.name}</span>
              <Link href="/profile" className="btn-outline">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Recipes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRecipes}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 text-secondary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Processed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.aiProcessed}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Shared</p>
                <p className="text-2xl font-bold text-gray-900">{stats.sharedRecipes}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/add-recipe" className="card-hover group">
              <div className="flex items-center space-x-3">
                <Plus className="h-6 w-6 text-primary-600 group-hover:text-primary-700" />
                <div>
                  <h3 className="font-medium text-gray-900">Add Recipe</h3>
                  <p className="text-sm text-gray-600">From URL, video, or text</p>
                </div>
              </div>
            </Link>

            <Link href="/recipes" className="card-hover group">
              <div className="flex items-center space-x-3">
                <Search className="h-6 w-6 text-secondary-600 group-hover:text-secondary-700" />
                <div>
                  <h3 className="font-medium text-gray-900">Browse Recipes</h3>
                  <p className="text-sm text-gray-600">View all your recipes</p>
                </div>
              </div>
            </Link>

            <Link href="/profile" className="card-hover group">
              <div className="flex items-center space-x-3">
                <ChefHat className="h-6 w-6 text-green-600 group-hover:text-green-700" />
                <div>
                  <h3 className="font-medium text-gray-900">Preferences</h3>
                  <p className="text-sm text-gray-600">Customize your experience</p>
                </div>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Recent Recipes */}
        {recentRecipes.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Recipes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentRecipes.map((recipe) => (
                <Link key={recipe._id} href={`/recipes/${recipe._id}`} className="card-hover">
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    {recipe.images?.[0]?.url ? (
                      <img 
                        src={recipe.images[0].url} 
                        alt={recipe.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ChefHat className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">{recipe.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{recipe.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{recipe.metadata.prepTime || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{recipe.metadata.servings} servings</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function LandingPage() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <ChefHat className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gradient">Recipe AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="btn-outline">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            AI-Powered Recipe
            <span className="text-gradient"> Intelligence</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Transform messy recipes from any source into clean, personalized cooking instructions. 
            Our AI learns your preferences and adapts every recipe to your kitchen and style.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link href="/register" className="btn-primary text-lg px-8 py-3">
              Start Cooking Smarter
            </Link>
            <Link href="/demo" className="btn-outline text-lg px-8 py-3">
              See How It Works
            </Link>
          </motion.div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Globe className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Any Source</h3>
            <p className="text-gray-600">
              Paste URLs from YouTube, AllRecipes, NYT Cooking, or any website. 
              Our AI extracts and structures the recipe automatically.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="h-8 w-8 text-secondary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Standardization</h3>
            <p className="text-gray-600">
              Converts units to your preference, normalizes equipment names, 
              and applies your common ingredient substitutions.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ChefHat className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalized</h3>
            <p className="text-gray-600">
              Adapts instructions to your equipment, skill level, and cooking style. 
              Gets smarter with every recipe you cook.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
