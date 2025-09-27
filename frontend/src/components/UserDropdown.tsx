'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Settings, 
  ChefHat, 
  LogOut,
  ChevronDown,
  Heart,
  BookOpen
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface UserDropdownProps {
  className?: string
}

export default function UserDropdown({ className = '' }: UserDropdownProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully!')
    router.push('/')
    setIsOpen(false)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  if (!user) return null

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
      >
        <div className="bg-primary-100 rounded-full p-1">
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name}
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <User className="h-6 w-6 text-primary-600" />
          )}
        </div>
        <span className="hidden sm:block">{user.name.split(' ')[0]}</span>
        <ChevronDown 
          className={`h-4 w-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 backdrop-blur-sm"
          >
            {/* User Info */}
            <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 rounded-full p-2">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-primary-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                  {user.provider !== 'local' && (
                    <p className="text-xs text-primary-600 font-medium capitalize">
                      {user.provider} Account
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => handleNavigation('/')}
                className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 transition-all duration-200 group"
              >
                <div className="p-1 rounded-md bg-primary-100 group-hover:bg-primary-200 transition-colors">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
                <span className="font-medium">Profile</span>
              </button>

              <button
                onClick={() => handleNavigation('/profile')}
                className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-secondary-50 hover:to-secondary-100 transition-all duration-200 group"
              >
                <div className="p-1 rounded-md bg-secondary-100 group-hover:bg-secondary-200 transition-colors">
                  <Heart className="h-4 w-4 text-secondary-600" />
                </div>
                <span className="font-medium">My Preferences</span>
              </button>

              <button
                onClick={() => handleNavigation('/recipes')}
                className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-200 group"
              >
                <div className="p-1 rounded-md bg-green-100 group-hover:bg-green-200 transition-colors">
                  <BookOpen className="h-4 w-4 text-green-600" />
                </div>
                <span className="font-medium">My Recipes</span>
              </button>

              <div className="border-t border-gray-100 my-2"></div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-200 group"
              >
                <div className="p-1 rounded-md bg-red-100 group-hover:bg-red-200 transition-colors">
                  <LogOut className="h-4 w-4" />
                </div>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
