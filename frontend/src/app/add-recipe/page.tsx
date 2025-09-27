'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Globe, 
  Video, 
  FileText, 
  Plus, 
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { recipeApi } from '@/lib/api'
import toast from 'react-hot-toast'

type RecipeSource = 'url' | 'youtube' | 'custom'

export default function AddRecipePage() {
  const [activeTab, setActiveTab] = useState<RecipeSource>('url')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    url: '',
    videoId: '',
    rawText: '',
    title: ''
  })
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let response

      switch (activeTab) {
        case 'url':
          if (!formData.url) {
            toast.error('Please enter a URL')
            setLoading(false)
            return
          }
          response = await recipeApi.createFromUrl(formData.url)
          break

        case 'youtube':
          if (!formData.videoId) {
            toast.error('Please enter a YouTube video ID')
            setLoading(false)
            return
          }
          response = await recipeApi.createFromYouTube(formData.videoId)
          break

        case 'custom':
          if (!formData.rawText) {
            toast.error('Please enter recipe text')
            setLoading(false)
            return
          }
          response = await recipeApi.createCustom(formData.rawText, formData.title)
          break
      }

      if (response && response.data && response.data._id) {
        // Check if AI processing failed
        if (response.data.aiProcessing && response.data.aiProcessing.errors && response.data.aiProcessing.errors.length > 0) {
          toast.success('Recipe imported successfully! (Note: AI processing had some issues, but the recipe was saved)', {
            duration: 5000
          })
        } else {
          toast.success('Recipe created successfully!')
        }
        router.push(`/recipes/${response.data._id}`)
      } else {
        toast.error('Recipe was created but could not redirect. Please check your recipes list.')
        router.push('/recipes')
      }
    } catch (error: any) {
      console.error('Recipe creation error:', error)
      toast.error(error.response?.data?.error || 'Failed to create recipe')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const extractYouTubeId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setFormData(prev => ({ ...prev, url }))
    
    // Auto-detect YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = extractYouTubeId(url)
      if (videoId) {
        setFormData(prev => ({ ...prev, videoId }))
        setActiveTab('youtube')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/" className="mr-4">
              <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Add New Recipe</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Source Selection Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'url', label: 'From URL', icon: Globe },
                { id: 'youtube', label: 'YouTube Video', icon: Video },
                { id: 'custom', label: 'Custom Text', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as RecipeSource)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Form */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'url' && (
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe URL
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleUrlChange}
                  className="input-field"
                  placeholder="https://www.allrecipes.com/recipe/..."
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Supported sites: AllRecipes, NYT Cooking, Food Network, and many more
                </p>
              </div>
            )}

            {activeTab === 'youtube' && (
              <div>
                <label htmlFor="videoId" className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube Video ID or URL
                </label>
                <input
                  type="text"
                  id="videoId"
                  name="videoId"
                  value={formData.videoId}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="dQw4w9WgXcQ or https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Enter the video ID or full YouTube URL. We'll extract the transcript and parse the recipe.
                </p>
              </div>
            )}

            {activeTab === 'custom' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Recipe Title (Optional)
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="My Grandma's Chocolate Cake"
                  />
                </div>
                <div>
                  <label htmlFor="rawText" className="block text-sm font-medium text-gray-700 mb-2">
                    Recipe Text
                  </label>
                  <textarea
                    id="rawText"
                    name="rawText"
                    value={formData.rawText}
                    onChange={handleInputChange}
                    rows={12}
                    className="input-field resize-none"
                    placeholder="Paste your recipe here... 

Ingredients:
- 2 cups all-purpose flour
- 1 cup sugar
- 1/2 cup butter
- 2 eggs
- 1 tsp vanilla extract

Instructions:
1. Preheat oven to 350°F
2. Mix dry ingredients in a bowl
3. Add wet ingredients and mix well
4. Pour into greased pan
5. Bake for 30 minutes"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Paste your recipe in any format. Our AI will structure it automatically.
                  </p>
                </div>
              </div>
            )}

            {/* AI Processing Info */}
            {loading ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Loader2 className="h-5 w-5 text-blue-600 mt-0.5 mr-3 animate-spin" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-900">AI Processing Recipe...</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      {activeTab === 'url' ? 'Extracting content from URL, parsing ingredients and instructions...' :
                       activeTab === 'youtube' ? 'Processing YouTube video transcript, analyzing recipe content...' :
                       'Analyzing recipe text, structuring ingredients and instructions...'}
                    </p>
                    <div className="mt-2 text-xs text-blue-600">
                      This may take 10-30 seconds depending on content complexity.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-900">AI Processing</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Our AI will automatically extract ingredients, instructions, and metadata from your input, 
                      then personalize it based on your preferences and equipment.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>
                      {activeTab === 'url' ? 'Extracting from URL...' :
                       activeTab === 'youtube' ? 'Processing YouTube video...' :
                       'Processing recipe...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    <span>Create Recipe</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tips for Best Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <h4 className="font-medium text-gray-900 mb-2">From URLs</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use direct recipe page URLs</li>
                <li>• Avoid video pages or search results</li>
                <li>• Works with most major recipe sites</li>
              </ul>
            </div>
            <div className="card">
              <h4 className="font-medium text-gray-900 mb-2">From YouTube</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Works best with cooking videos</li>
                <li>• Requires clear audio/transcript</li>
                <li>• May take longer to process</li>
              </ul>
            </div>
            <div className="card">
              <h4 className="font-medium text-gray-900 mb-2">Custom Text</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Include ingredients and instructions</li>
                <li>• Any format works</li>
                <li>• Add cooking times if known</li>
              </ul>
            </div>
            <div className="card">
              <h4 className="font-medium text-gray-900 mb-2">AI Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Converts units to your preference</li>
                <li>• Adapts to your equipment</li>
                <li>• Learns from your edits</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
