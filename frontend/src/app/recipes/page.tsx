'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Plus, 
  ChefHat, 
  Clock, 
  Users,
  Sparkles,
  Globe,
  Video,
  FileText
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
    mealType: string[]
  }
  source: {
    type: string
    platform?: string
  }
  aiProcessing: {
    isProcessed: boolean
    confidenceScore: number
  }
  images: Array<{ url: string; isPrimary: boolean }>
  createdAt: string
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchRecipes()
  }, [])

  const fetchRecipes = async () => {
    try {
      const response = await recipeApi.getRecipes({ limit: 50 })
      setRecipes(response.data.recipes)
    } catch (error) {
      console.error('Failed to fetch recipes:', error)
      toast.error('Failed to load recipes')
    } finally {
      setLoading(false)
    }
  }

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => recipe.metadata.tags.includes(tag))
    
    const matchesMealTypes = selectedMealTypes.length === 0 || 
                            selectedMealTypes.some(type => recipe.metadata.mealType.includes(type))
    
    return matchesSearch && matchesTags && matchesMealTypes
  })

  const allTags = Array.from(new Set(recipes.flatMap(r => r.metadata.tags)))
  const allMealTypes = Array.from(new Set(recipes.flatMap(r => r.metadata.mealType)))

  const getSourceIcon = (source: Recipe['source']) => {
    switch (source.type) {
      case 'url':
        return <Globe className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'manual':
        return <FileText className="h-4 w-4" />
      default:
        return <ChefHat className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Recipes</h1>
              <p className="text-gray-600 mt-1">{recipes.length} recipes in your collection</p>
            </div>
            <Link href="/add-recipe" className="btn-primary flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Add Recipe</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-white rounded-lg border border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tags Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Tags</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {allTags.map((tag) => (
                      <label key={tag} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTags([...selectedTags, tag])
                            } else {
                              setSelectedTags(selectedTags.filter(t => t !== tag))
                            }
                          }}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Meal Types Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Meal Type</h3>
                  <div className="space-y-2">
                    {allMealTypes.map((mealType) => (
                      <label key={mealType} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedMealTypes.includes(mealType)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMealTypes([...selectedMealTypes, mealType])
                            } else {
                              setSelectedMealTypes(selectedMealTypes.filter(t => t !== mealType))
                            }
                          }}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{mealType}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Recipes Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedTags.length > 0 || selectedMealTypes.length > 0 
                ? 'No recipes match your filters' 
                : 'No recipes yet'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedTags.length > 0 || selectedMealTypes.length > 0
                ? 'Try adjusting your search or filters'
                : 'Start by adding your first recipe!'
              }
            </p>
            <Link href="/add-recipe" className="btn-primary">
              Add Your First Recipe
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe, index) => (
              <motion.div
                key={recipe._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/recipes/${recipe._id}`} className="card-hover group">
                  {/* Recipe Image */}
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    {recipe.images?.[0]?.url ? (
                      <img 
                        src={recipe.images[0].url} 
                        alt={recipe.title}
                        className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ChefHat className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Recipe Info */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                        {recipe.title}
                      </h3>
                      <div className="flex items-center space-x-1 text-gray-500">
                        {getSourceIcon(recipe.source)}
                        {recipe.aiProcessing.isProcessed && (
                          <span title="AI Processed">
                            <Sparkles className="h-4 w-4 text-primary-500" />
                          </span>
                        )}
                      </div>
                    </div>

                    {recipe.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {recipe.description}
                      </p>
                    )}

                    {/* Metadata */}
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

                    {/* Tags */}
                    {recipe.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {recipe.metadata.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                        {recipe.metadata.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{recipe.metadata.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
