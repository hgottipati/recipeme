'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '@/lib/api'

interface User {
  id: string
  email: string
  name: string
  preferences: {
    measurementUnits: 'metric' | 'imperial' | 'mixed'
    dietaryRestrictions: string[]
    preferredCookingMethods: string[]
    skillLevel: 'beginner' | 'intermediate' | 'advanced'
    preferredIngredients: string[]
    dislikedIngredients: string[]
    commonSubstitutions: Record<string, string>
  }
  equipment: Array<{
    _id: string
    name: string
    type: string
    brand?: string
    model?: string
  }>
  aiLearningData: {
    totalRecipesParsed: number
    totalRecipesEdited: number
    preferredInstructionsStyle: 'simple' | 'detailed' | 'professional'
    feedbackHistory: Array<{
      recipeId: string
      feedback: 'thumbs-up' | 'thumbs-down' | 'neutral'
      timestamp: string
    }>
  }
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>
  addEquipment: (equipment: Omit<User['equipment'][0], '_id'>) => Promise<void>
  removeEquipment: (equipmentId: string) => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored token on app load
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
      // Fetch user profile
      fetchUserProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile')
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      // Token might be invalid, clear it
      localStorage.removeItem('token')
      setToken(null)
      api.defaults.headers.common['Authorization'] = ''
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/users/login', { email, password })
      const { token: newToken, user: userData } = response.data
      
      setToken(newToken)
      setUser(userData)
      localStorage.setItem('token', newToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed')
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await api.post('/users/register', { name, email, password })
      const { token: newToken, user: userData } = response.data
      
      setToken(newToken)
      setUser(userData)
      localStorage.setItem('token', newToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed')
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    api.defaults.headers.common['Authorization'] = ''
  }

  const updatePreferences = async (preferences: Partial<User['preferences']>) => {
    try {
      await api.put('/users/preferences', { preferences })
      setUser(prev => prev ? { ...prev, preferences: { ...prev.preferences, ...preferences } } : null)
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update preferences')
    }
  }

  const addEquipment = async (equipment: Omit<User['equipment'][0], '_id'>) => {
    try {
      const response = await api.post('/users/equipment', equipment)
      setUser(prev => prev ? { ...prev, equipment: response.data.equipment } : null)
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to add equipment')
    }
  }

  const removeEquipment = async (equipmentId: string) => {
    try {
      const response = await api.delete(`/users/equipment/${equipmentId}`)
      setUser(prev => prev ? { ...prev, equipment: response.data.equipment } : null)
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to remove equipment')
    }
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    updatePreferences,
    addEquipment,
    removeEquipment,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
