'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Settings, 
  ChefHat, 
  Plus, 
  Trash2, 
  Save,
  Clock,
  Users,
  Sparkles,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updatePreferences, addEquipment, removeEquipment, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'preferences' | 'equipment'>('preferences')
  const [preferences, setPreferences] = useState(user?.preferences || {
    measurementUnits: 'imperial' as const,
    dietaryRestrictions: [],
    preferredCookingMethods: [],
    skillLevel: 'intermediate' as const,
    preferredIngredients: [],
    dislikedIngredients: [],
    commonSubstitutions: {}
  })
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    type: 'appliance',
    brand: '',
    model: ''
  })

  useEffect(() => {
    if (user) {
      setPreferences(user.preferences || {
        measurementUnits: 'imperial' as const,
        dietaryRestrictions: [],
        preferredCookingMethods: [],
        skillLevel: 'intermediate' as const,
        preferredIngredients: [],
        dislikedIngredients: [],
        commonSubstitutions: {}
      })
    }
  }, [user])

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSavePreferences = async () => {
    try {
      await updatePreferences(preferences)
      toast.success('Preferences updated successfully!')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEquipment.name.trim()) {
      toast.error('Equipment name is required')
      return
    }

    try {
      await addEquipment(newEquipment)
      setNewEquipment({ name: '', type: 'appliance', brand: '', model: '' })
      toast.success('Equipment added successfully!')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleRemoveEquipment = async (equipmentId: string) => {
    try {
      await removeEquipment(equipmentId)
      toast.success('Equipment removed successfully!')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully!')
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-100 rounded-full p-3">
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
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600">{user.email}</p>
                {user.provider !== 'local' && (
                  <p className="text-xs text-gray-500 capitalize">
                    Signed in with {user.provider}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-center">
              <ChefHat className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recipes Parsed</p>
                <p className="text-2xl font-bold text-gray-900">{user.aiLearningData.totalRecipesParsed}</p>
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
                <p className="text-sm font-medium text-gray-600">Recipes Edited</p>
                <p className="text-2xl font-bold text-gray-900">{user.aiLearningData.totalRecipesEdited}</p>
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
              <Settings className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Equipment</p>
                <p className="text-2xl font-bold text-gray-900">{user.equipment.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'preferences', label: 'Preferences', icon: Settings },
                { id: 'equipment', label: 'Equipment', icon: ChefHat }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'preferences' | 'equipment')}
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

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <motion.div 
            key="preferences"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cooking Preferences</h3>
              
              <div className="space-y-6">
                {/* Measurement Units */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Measurement Units
                  </label>
                  <select
                    value={preferences.measurementUnits || 'imperial'}
                    onChange={(e) => handlePreferenceChange('measurementUnits', e.target.value)}
                    className="input-field"
                  >
                    <option value="imperial">Imperial (cups, ounces, pounds)</option>
                    <option value="metric">Metric (grams, milliliters, kilograms)</option>
                    <option value="mixed">Mixed (keep original)</option>
                  </select>
                </div>

                {/* Skill Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cooking Skill Level
                  </label>
                  <select
                    value={preferences.skillLevel || 'intermediate'}
                    onChange={(e) => handlePreferenceChange('skillLevel', e.target.value)}
                    className="input-field"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Dietary Restrictions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dietary Restrictions
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'keto', 'paleo'].map((restriction) => (
                      <label key={restriction} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={preferences.dietaryRestrictions?.includes(restriction) || false}
                          onChange={(e) => {
                            const restrictions = preferences.dietaryRestrictions || []
                            if (e.target.checked) {
                              handlePreferenceChange('dietaryRestrictions', [...restrictions, restriction])
                            } else {
                              handlePreferenceChange('dietaryRestrictions', restrictions.filter(r => r !== restriction))
                            }
                          }}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{restriction}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Preferred Cooking Methods */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Cooking Methods
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['stovetop', 'oven', 'microwave', 'instant-pot', 'air-fryer', 'slow-cooker', 'grill'].map((method) => (
                      <label key={method} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={preferences.preferredCookingMethods?.includes(method) || false}
                          onChange={(e) => {
                            const methods = preferences.preferredCookingMethods || []
                            if (e.target.checked) {
                              handlePreferenceChange('preferredCookingMethods', [...methods, method])
                            } else {
                              handlePreferenceChange('preferredCookingMethods', methods.filter(m => m !== method))
                            }
                          }}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{method.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Instruction Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Instruction Style
                  </label>
                  <select
                    value={preferences.aiLearningData?.preferredInstructionsStyle || 'detailed'}
                    onChange={(e) => handlePreferenceChange('aiLearningData', {
                      ...preferences.aiLearningData,
                      preferredInstructionsStyle: e.target.value
                    })}
                    className="input-field"
                  >
                    <option value="simple">Simple & Concise</option>
                    <option value="detailed">Detailed & Thorough</option>
                    <option value="professional">Professional & Technical</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button onClick={handleSavePreferences} className="btn-primary flex items-center space-x-2">
                  <Save className="h-5 w-5" />
                  <span>Save Preferences</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Equipment Tab */}
        {activeTab === 'equipment' && (
          <motion.div 
            key="equipment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Add Equipment Form */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Equipment</h3>
              <form onSubmit={handleAddEquipment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipment Name *
                    </label>
                    <input
                      type="text"
                      value={newEquipment.name}
                      onChange={(e) => setNewEquipment(prev => ({ ...prev, name: e.target.value }))}
                      className="input-field"
                      placeholder="e.g., Instant Pot, Air Fryer"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={newEquipment.type}
                      onChange={(e) => setNewEquipment(prev => ({ ...prev, type: e.target.value }))}
                      className="input-field"
                    >
                      <option value="appliance">Appliance</option>
                      <option value="tool">Tool</option>
                      <option value="utensil">Utensil</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand (Optional)
                    </label>
                    <input
                      type="text"
                      value={newEquipment.brand}
                      onChange={(e) => setNewEquipment(prev => ({ ...prev, brand: e.target.value }))}
                      className="input-field"
                      placeholder="e.g., Instant Pot, Ninja"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model (Optional)
                    </label>
                    <input
                      type="text"
                      value={newEquipment.model}
                      onChange={(e) => setNewEquipment(prev => ({ ...prev, model: e.target.value }))}
                      className="input-field"
                      placeholder="e.g., Duo 7-in-1"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add Equipment</span>
                </button>
              </form>
            </div>

            {/* Equipment List */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Equipment</h3>
              {user.equipment.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No equipment added yet. Add some to get personalized recipe instructions!</p>
              ) : (
                <div className="space-y-3">
                  {user.equipment.map((equipment) => (
                    <div key={equipment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{equipment.name}</h4>
                        <p className="text-sm text-gray-600">
                          {equipment.brand && `${equipment.brand} `}
                          {equipment.model && `${equipment.model} `}
                          <span className="capitalize">({equipment.type})</span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveEquipment(equipment._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
