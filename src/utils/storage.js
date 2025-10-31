// Storage utility for persisting app data to localStorage

const STORAGE_KEYS = {
  POSTS: 'connecthub_posts',
  USERS: 'connecthub_users',
  CHATS: 'connecthub_chats',
  MESSAGES: 'connecthub_messages',
  NOTIFICATIONS: 'connecthub_notifications',
  GROUPS: 'connecthub_groups',
  EVENTS: 'connecthub_events',
}

/**
 * Get data from localStorage or return default
 */
export const getStoredData = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage for key ${key}:`, error)
    return defaultValue
  }
}

// Debounce queue for localStorage writes
const saveQueue = new Map()
let saveTimeout = null

/**
 * Save data to localStorage (with debouncing for performance)
 */
export const saveStoredData = (key, data) => {
  try {
    // Queue the save operation
    saveQueue.set(key, data)
    
    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    
    // Debounce: save after 100ms of no new updates
    saveTimeout = setTimeout(() => {
      saveQueue.forEach((value, queueKey) => {
        try {
          localStorage.setItem(queueKey, JSON.stringify(value))
        } catch (error) {
          console.error(`Error saving to localStorage for key ${queueKey}:`, error)
        }
      })
      saveQueue.clear()
      saveTimeout = null
    }, 100)
    
    return true
  } catch (error) {
    console.error(`Error queueing localStorage save for key ${key}:`, error)
    return false
  }
}

/**
 * Force immediate save (use sparingly)
 */
export const saveStoredDataImmediate = (key, data) => {
  try {
    // Clear any pending saves for this key
    saveQueue.delete(key)
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (error) {
    console.error(`Error saving to localStorage for key ${key}:`, error)
    return false
  }
}

/**
 * Initialize posts data - merge stored posts with mock data
 */
export const initializePosts = (mockPosts) => {
  const storedPosts = getStoredData(STORAGE_KEYS.POSTS, [])
  
  if (storedPosts.length === 0) {
    // First time - save mock posts
    saveStoredData(STORAGE_KEYS.POSTS, mockPosts)
    return mockPosts
  }
  
  // Merge stored posts with new mock posts (in case new posts were added)
  const storedPostIds = new Set(storedPosts.map(p => p.id))
  const newPosts = mockPosts.filter(p => !storedPostIds.has(p.id))
  
  const mergedPosts = [...storedPosts, ...newPosts]
  saveStoredData(STORAGE_KEYS.POSTS, mergedPosts)
  
  return mergedPosts
}

/**
 * Update a specific post
 */
export const updatePost = (postId, updates) => {
  const posts = getStoredData(STORAGE_KEYS.POSTS, [])
  const updatedPosts = posts.map(post => 
    post.id === postId ? { ...post, ...updates } : post
  )
  saveStoredData(STORAGE_KEYS.POSTS, updatedPosts)
  return updatedPosts
}

/**
 * Add a new post
 */
export const addPost = (newPost) => {
  const posts = getStoredData(STORAGE_KEYS.POSTS, [])
  const updatedPosts = [newPost, ...posts]
  saveStoredData(STORAGE_KEYS.POSTS, updatedPosts)
  return updatedPosts
}

/**
 * Initialize users data
 * Prioritizes stored users completely - stored users override mock users entirely
 */
export const initializeUsers = (mockUsers) => {
  const storedUsers = getStoredData(STORAGE_KEYS.USERS, [])
  
  if (storedUsers.length === 0) {
    // First time - save mock users
    saveStoredData(STORAGE_KEYS.USERS, mockUsers)
    return mockUsers
  }
  
  // Prioritize stored users completely - if a user exists in storage, use that
  // Only add mock users that don't exist in storage
  const storedUserMap = new Map(storedUsers.map(u => [u.id, u]))
  const mergedUsers = [...storedUsers] // Start with all stored users (preserves all updates)
  
  // Add any mock users that don't exist in storage
  mockUsers.forEach(mockUser => {
    if (!storedUserMap.has(mockUser.id)) {
      mergedUsers.push(mockUser)
    }
  })
  
  // Don't overwrite stored data unnecessarily - only save if we added new mock users
  // This prevents losing updates when the function is called multiple times
  if (mergedUsers.length !== storedUsers.length) {
    saveStoredData(STORAGE_KEYS.USERS, mergedUsers)
  }
  
  return mergedUsers
}

/**
 * Update a specific user
 */
export const updateUser = (userId, updates) => {
  const users = getStoredData(STORAGE_KEYS.USERS, [])
  const updatedUsers = users.map(user => 
    user.id === userId ? { ...user, ...updates } : user
  )
  saveStoredData(STORAGE_KEYS.USERS, updatedUsers)
  return updatedUsers
}

/**
 * Add a new user (for signup)
 */
export const addUser = (newUser) => {
  const users = getStoredData(STORAGE_KEYS.USERS, [])
  const updatedUsers = [...users, newUser]
  saveStoredData(STORAGE_KEYS.USERS, updatedUsers)
  return updatedUsers
}

/**
 * Initialize other data types
 */
export const initializeData = (key, mockData) => {
  const storedData = getStoredData(key, [])
  if (storedData.length === 0) {
    saveStoredData(key, mockData)
    return mockData
  }
  return storedData
}

/**
 * Update data array
 */
export const updateData = (key, itemId, updates) => {
  const data = getStoredData(key, [])
  const updatedData = data.map(item => 
    item.id === itemId ? { ...item, ...updates } : item
  )
  saveStoredData(key, updatedData)
  return updatedData
}

/**
 * Add item to data array
 */
export const addDataItem = (key, newItem) => {
  const data = getStoredData(key, [])
  const updatedData = [...data, newItem]
  saveStoredData(key, updatedData)
  return updatedData
}

export { STORAGE_KEYS }

