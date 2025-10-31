import { createContext, useContext, useState, useEffect } from 'react'
import { mockNotifications } from '../api/mockData'
import { useAuth } from './AuthContext'
import { initializeData, getStoredData, saveStoredData, STORAGE_KEYS } from '../utils/storage'

const NotificationContext = createContext(null)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      // Load notifications from storage
      const storedNotifications = initializeData(STORAGE_KEYS.NOTIFICATIONS, mockNotifications)
      
      // Filter notifications for current user
      const userNotifications = storedNotifications.filter(
        n => n.userId === user.id
      )
      setNotifications(userNotifications)
      setUnreadCount(userNotifications.filter(n => !n.read).length)
    }
  }, [user])

  const addNotification = (notification) => {
    if (!user) return
    
    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      userId: user.id,
      read: false,
      createdAt: new Date().toISOString(),
    }
    
    // Save to storage
    const storedNotifications = getStoredData(STORAGE_KEYS.NOTIFICATIONS, [])
    const updatedNotifications = [newNotification, ...storedNotifications]
    saveStoredData(STORAGE_KEYS.NOTIFICATIONS, updatedNotifications)
    
    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => prev + 1)
  }

  const markAsRead = (notificationId) => {
    // Update in storage
    const storedNotifications = getStoredData(STORAGE_KEYS.NOTIFICATIONS, [])
    const updatedNotifications = storedNotifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    )
    saveStoredData(STORAGE_KEYS.NOTIFICATIONS, updatedNotifications)
    
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    if (!user) return
    
    // Update in storage
    const storedNotifications = getStoredData(STORAGE_KEYS.NOTIFICATIONS, [])
    const updatedNotifications = storedNotifications.map(n =>
      n.userId === user.id ? { ...n, read: true } : n
    )
    saveStoredData(STORAGE_KEYS.NOTIFICATIONS, updatedNotifications)
    
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
    setUnreadCount(0)
  }

  const clearAll = () => {
    if (!user) return
    
    // Update in storage
    const storedNotifications = getStoredData(STORAGE_KEYS.NOTIFICATIONS, [])
    const updatedNotifications = storedNotifications.filter(n => n.userId !== user.id)
    saveStoredData(STORAGE_KEYS.NOTIFICATIONS, updatedNotifications)
    
    setNotifications([])
    setUnreadCount(0)
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

