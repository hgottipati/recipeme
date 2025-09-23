'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  ChefHat, 
  Share2, 
  Edit, 
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { recipeApi, userApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface Recipe {
  _id: string
  title: string
  description?: string
  ingredients: Array<{
    name: string
    amount: string
    unit: string
    notes?: string
  }>
  instructions: Array<{
    stepNumber: number
    instruction: string
    time?: string
    temperature?: string
    equipment?: string[]
    tips?: string[]
  }>
  metadata: {
    prepTime: string
    cookTime: string
    totalTime: string
    servings: number
    difficulty: string
    cuisine: string[]
    tags: string[]
    mealType: string[]
  }
  source: {
    type: string
    url?: string
    platform?: string
    videoId?: string
  }
  aiProcessing: {
    isProcessed: boolean
    processedAt: string
    originalFormat: string
    standardizationApplied: string[]
    personalizationApplied: string[]
    confidenceScore: number
  }
  images: Array<{ url: string; caption?: string; isPrimary: boolean }>
  createdAt: string
  updatedAt: string
}

export default function RecipePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchRecipe(params.id as string)
    }
  }, [params.id])

  const fetchRecipe = async (id: string) => {
    try {
      const response = await recipeApi.getRecipe(id)
      setRecipe(response.data)
    } catch (error) {
      console.error('Failed to fetch recipe:', error)
      toast.error('Failed to load recipe')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!recipe) return
    
    try {
      const response = await recipeApi.shareRecipe(recipe._id)
      setShareUrl(response.data.shareUrl)
      setShowShareModal(true)
      toast.success('Recipe shared successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to share recipe')
    }
  }

  const handleDelete = async () => {
    if (!recipe || !confirm('Are you sure you want to delete this recipe?')) return
    
    try {
      await recipeApi.deleteRecipe(recipe._id)
      toast.success('Recipe deleted successfully')
      router.push('/')
    } catch (error: any) {
      toast.error('Failed to delete recipe')
    }
  }

  const handleFeedback = async (feedback: 'thumbs-up' | 'thumbs-down') => {
    if (!recipe) return
    
    try {
      await userApi.provideFeedback(recipe._id, feedback)
      toast.success('Feedback recorded!')
    } catch (error: any) {
      toast.error('Failed to record feedback')
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    toast.success('Share link copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Recipe not found</h1>
          <Link href="/" className="btn-primary">Go Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">{recipe.title}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleFeedback('thumbs-up')}
                className="p-2 text-gray-600 hover:text-green-600"
                title="Good recipe"
              >
                <ThumbsUp className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleFeedback('thumbs-down')}
                className="p-2 text-gray-600 hover:text-red-600"
                title="Needs improvement"
              >
                <ThumbsDown className="h-5 w-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-primary-600"
                title="Share recipe"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-gray-600 hover:text-red-600"
                title="Delete recipe"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recipe Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-8"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Recipe Image */}
            <div className="md:w-1/3">
              {recipe.images?.[0]?.url ? (
                <img 
                  src={recipe.images[0].url} 
                  alt={recipe.title}
                  className="w-full h-64 md:h-48 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 md:h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <ChefHat className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Recipe Info */}
            <div className="md:w-2/3">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{recipe.title}</h1>
              {recipe.description && (
                <p className="text-gray-600 mb-6">{recipe.description}</p>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <Clock className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Prep Time</p>
                  <p className="font-medium">{recipe.metadata.prepTime || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <Clock className="h-6 w-6 text-secondary-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Cook Time</p>
                  <p className="font-medium">{recipe.metadata.cookTime || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Servings</p>
                  <p className="font-medium">{recipe.metadata.servings}</p>
                </div>
                <div className="text-center">
                  <ChefHat className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Difficulty</p>
                  <p className="font-medium capitalize">{recipe.metadata.difficulty}</p>
                </div>
              </div>

              {/* Tags */}
              {recipe.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {recipe.metadata.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ingredients */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ingredients</h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-800 text-sm rounded-full flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <span className="font-medium">{ingredient.amount} {ingredient.unit}</span>
                    <span className="ml-2">{ingredient.name}</span>
                    {ingredient.notes && (
                      <p className="text-sm text-gray-600 mt-1">{ingredient.notes}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Instructions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-secondary-100 text-secondary-800 text-sm rounded-full flex items-center justify-center font-medium">
                    {instruction.stepNumber}
                  </span>
                  <div className="flex-1">
                    <p className="text-gray-900">{instruction.instruction}</p>
                    {instruction.time && (
                      <p className="text-sm text-gray-600 mt-1">
                        <Clock className="h-4 w-4 inline mr-1" />
                        {instruction.time}
                      </p>
                    )}
                    {instruction.temperature && (
                      <p className="text-sm text-gray-600 mt-1">
                        Temperature: {instruction.temperature}
                      </p>
                    )}
                    {instruction.equipment && instruction.equipment.length > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        Equipment: {instruction.equipment.join(', ')}
                      </p>
                    )}
                    {instruction.tips && instruction.tips.length > 0 && (
                      <div className="mt-2">
                        {instruction.tips.map((tip, tipIndex) => (
                          <p key={tipIndex} className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                            💡 {tip}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>
        </div>

        {/* AI Processing Info */}
        {recipe.aiProcessing.isProcessed && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card mt-8"
          >
            <div className="flex items-start space-x-3">
              <Sparkles className="h-6 w-6 text-primary-600 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">AI Processing Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Original Format:</p>
                    <p className="font-medium capitalize">{recipe.aiProcessing.originalFormat}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Confidence Score:</p>
                    <p className="font-medium">{(recipe.aiProcessing.confidenceScore * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Standardization Applied:</p>
                    <p className="font-medium">{recipe.aiProcessing.standardizationApplied.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Personalization Applied:</p>
                    <p className="font-medium">{recipe.aiProcessing.personalizationApplied.join(', ')}</p>
                  </div>
                </div>
                {recipe.source.url && (
                  <div className="mt-4">
                    <a 
                      href={recipe.source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary-600 hover:text-primary-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Original Source
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Share Recipe</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="input-field rounded-r-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="btn-primary rounded-l-none"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
