'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '@/lib/api'
import dynamic from 'next/dynamic'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  provider: 'local' | 'google' | 'facebook'
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
  handleOAuthLogin: (token: string) => Promise<void>
  logout: () => void
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>
  addEquipment: (equipment: Omit<User['equipment'][0], '_id'>) => Promise<void>
  removeEquipment: (equipmentId: string) => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Default context for SSR
const defaultContext: AuthContextType = {
  user: null,
  token: null,
  login: async () => {},
  register: async () => {},
  handleOAuthLogin: async () => {},
  logout: () => {},
  updatePreferences: async () => {},
  addEquipment: async () => {},
  removeEquipment: async () => {},
  loading: true
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Return a default context during SSR
    if (typeof window === 'undefined') {
      return defaultContext
    }
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

const AuthProviderInner: React.FC<AuthProviderProps> = ({ children }) => {
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

  // Method to handle OAuth login
  const handleOAuthLogin = async (token: string) => {
    try {
      setToken(token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      await fetchUserProfile()
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'OAuth login failed')
    }
  }

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile')
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      // Token might be invalid, clear it
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', newToken)
      }
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed, please try again')
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await api.post('/users/register', { name, email, password })
      const { token: newToken, user: userData } = response.data
      
      setToken(newToken)
      setUser(userData)
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', newToken)
      }
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed, please try again')
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
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
    handleOAuthLogin,
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

// Client-only wrapper to prevent SSR issues
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return default context during SSR
    return (
      <AuthContext.Provider value={defaultContext}>
        {children}
      </AuthContext.Provider>
    )
  }

  return <AuthProviderInner>{children}</AuthProviderInner>
}
