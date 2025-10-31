import { createContext, useContext, useState, useEffect } from 'react'
import { mockUsers, mockCurrentUser } from '../api/mockData'
import { initializeUsers, updateUser as updateUserStorage, addUser as addUserStorage, STORAGE_KEYS, getStoredData } from '../utils/storage'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize users storage FIRST - this ensures stored data is loaded
    const allUsers = initializeUsers(mockUsers)
    
    // Always start at login page - clear stored session on app start
    // This ensures users must log in every time they refresh or open the app
    localStorage.removeItem('user')
    setUser(null)
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Initialize users storage first (to ensure stored data is loaded)
    initializeUsers(mockUsers)
    
    // Get users from storage (this will have all updates)
    const storedUsers = getStoredData(STORAGE_KEYS.USERS, mockUsers)
    const foundUser = storedUsers.find(u => u.email === email)
    
    if (foundUser && foundUser.password === password) {
      // Get the complete user data from storage (with all updates)
      const userData = { ...foundUser }
      delete userData.password
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true, user: userData }
    }
    return { success: false, error: 'Invalid credentials' }
  }

  const signup = async (userData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
      friends: [],
      friendRequests: [],
      posts: [],
      photos: [],
    }
    
    // Add to stored users
    addUserStorage(newUser)
    
    const userWithoutPassword = { ...newUser }
    delete userWithoutPassword.password
    setUser(userWithoutPassword)
    localStorage.setItem('user', JSON.stringify(userWithoutPassword))
    return { success: true, user: userWithoutPassword }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const updateUser = (updates) => {
    if (!user) return
    
    // Update in stored users array FIRST (this is the source of truth)
    updateUserStorage(user.id, updates)
    
    // Get the updated user from storage to ensure we have all fields
    const storedUsers = getStoredData(STORAGE_KEYS.USERS, [])
    const updatedUserFromStorage = storedUsers.find(u => u.id === user.id)
    
    // Update current session with the complete user data from storage
    if (updatedUserFromStorage) {
      const userWithoutPassword = { ...updatedUserFromStorage }
      delete userWithoutPassword.password
      setUser(userWithoutPassword)
      localStorage.setItem('user', JSON.stringify(userWithoutPassword))
    } else {
      // Fallback if user not found in storage
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

