import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://recipeme-vcc9.onrender.com/api'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear token but let components handle redirect
      localStorage.removeItem('token')
      // Don't automatically redirect - let individual components handle this
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const recipeApi = {
  // Get all recipes
  getRecipes: (params?: any) => api.get('/recipes', { params }),
  
  // Get single recipe
  getRecipe: (id: string) => api.get(`/recipes/${id}`),
  
  // Create recipe from URL
  createFromUrl: (url: string) => api.post('/recipes/from-url', { url }),
  
  // Create recipe from YouTube
  createFromYouTube: (videoId: string) => api.post('/recipes/from-youtube', { videoId }),
  
  // Create custom recipe
  createCustom: (rawText: string, title?: string) => api.post('/recipes/custom', { rawText, title }),
  
  // Update recipe
  updateRecipe: (id: string, data: any) => api.put(`/recipes/${id}`, data),
  
  // Delete recipe
  deleteRecipe: (id: string) => api.delete(`/recipes/${id}`),
  
  // Share recipe
  shareRecipe: (id: string) => api.post(`/recipes/${id}/share`),
  
  // Get shared recipe
  getSharedRecipe: (shareId: string) => api.get(`/recipes/shared/${shareId}`),
}

export const userApi = {
  // Get user profile
  getProfile: () => api.get('/users/profile'),
  
  // Update preferences
  updatePreferences: (preferences: any) => api.put('/users/preferences', { preferences }),
  
  // Add equipment
  addEquipment: (equipment: any) => api.post('/users/equipment', equipment),
  
  // Remove equipment
  removeEquipment: (id: string) => api.delete(`/users/equipment/${id}`),
  
  // Provide feedback
  provideFeedback: (recipeId: string, feedback: string) => api.post('/users/feedback', { recipeId, feedback }),
  
  // Get user stats
  getStats: () => api.get('/users/stats'),
}

export const aiApi = {
  // Parse text
  parseText: (text: string) => api.post('/ai/parse', { text }),
  
  // Standardize recipe
  standardizeRecipe: (recipe: any) => api.post('/ai/standardize', { recipe }),
  
  // Personalize recipe
  personalizeRecipe: (recipe: any) => api.post('/ai/personalize', { recipe }),
  
  // Extract from URL
  extractFromUrl: (url: string) => api.post('/ai/extract-url', { url }),
  
  // Extract from YouTube
  extractFromYouTube: (videoId: string) => api.post('/ai/extract-youtube', { videoId }),
}

export default api
