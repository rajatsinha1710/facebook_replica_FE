import { createContext, useContext, useState, useEffect } from 'react'
import { mockMessages, mockChats } from '../api/mockData'
import { useAuth } from './AuthContext'
import { initializeData, addDataItem, getStoredData, saveStoredData, STORAGE_KEYS } from '../utils/storage'

const ChatContext = createContext(null)

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

export const ChatProvider = ({ children }) => {
  const { user } = useAuth()
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])

  // Function to load chats and messages
  const loadChatData = () => {
    if (!user) return

    // Initialize chats and messages from storage
    const storedChats = initializeData(STORAGE_KEYS.CHATS, mockChats)
    
    // Filter chats for current user (chats where user is a participant)
    // Ensure participants array exists and includes user
    const userChats = storedChats.filter(chat => {
      const participants = chat.participants || []
      return Array.isArray(participants) && participants.includes(user.id)
    })
    
    // Sort chats by last message time (most recent first)
    const sortedChats = userChats.sort((a, b) => {
      const timeA = new Date(a.lastMessageAt || a.createdAt || 0).getTime()
      const timeB = new Date(b.lastMessageAt || b.createdAt || 0).getTime()
      return timeB - timeA
    })
    
    setChats(sortedChats)

    // Load messages from storage
    const storedMessages = getStoredData(STORAGE_KEYS.MESSAGES, mockMessages)
    
    // If there's an active chat, filter messages for it
    if (activeChat && sortedChats.find(c => c.id === activeChat.id)) {
      const chatMessages = storedMessages
        .filter(m => m.chatId === activeChat.id)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      setMessages(chatMessages)
    } else {
      // Get messages for all user's chats
      const userChatIds = sortedChats.map(c => c.id)
      const userMessages = storedMessages.filter(m => userChatIds.includes(m.chatId))
      setMessages(userMessages)
    }
  }

  useEffect(() => {
    loadChatData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Poll for new messages every 2 seconds (simulates real-time updates)
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      loadChatData()
    }, 2000) // Check every 2 seconds

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeChat])

  useEffect(() => {
    if (activeChat && user) {
      // Load messages for the active chat
      const storedMessages = getStoredData(STORAGE_KEYS.MESSAGES, [])
      const chatMessages = storedMessages
        .filter(m => m.chatId === activeChat.id)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      setMessages(chatMessages)
    } else if (!activeChat && user) {
      // No active chat - clear messages or show all user's messages
      loadChatData()
    }
  }, [activeChat, user])

  const sendMessage = (chatId, content) => {
    if (!user || !chatId) return
    
    // Ensure chat exists before sending message
    const storedChats = getStoredData(STORAGE_KEYS.CHATS, [])
    let chat = storedChats.find(c => c.id === chatId)
    
    // If chat doesn't exist, something went wrong - shouldn't happen, but handle gracefully
    if (!chat) {
      console.error('Chat not found for chatId:', chatId)
      return
    }
    
    const newMessage = {
      id: Date.now().toString(),
      chatId,
      senderId: user.id,
      content,
      createdAt: new Date().toISOString(),
      read: false,
    }
    
    // Save message to storage
    const storedMessages = getStoredData(STORAGE_KEYS.MESSAGES, [])
    const updatedMessages = [...storedMessages, newMessage]
    saveStoredData(STORAGE_KEYS.MESSAGES, updatedMessages)
    
    // Optimistically update UI
    setMessages(prev => [...prev, newMessage])
    
    // Update chat last message in storage (this will be visible to both participants)
    const updatedChats = storedChats.map(chat =>
      chat.id === chatId
        ? { ...chat, lastMessage: content, lastMessageAt: newMessage.createdAt }
        : chat
    )
    saveStoredData(STORAGE_KEYS.CHATS, updatedChats)
    setChats(updatedChats.filter(chat => chat.participants.includes(user.id)))
  }

  const startChat = (userId) => {
    if (!user || userId === user.id) return
    
    // Check in storage for existing chat between these two users
    // Make sure participants array comparison is order-independent
    const storedChats = getStoredData(STORAGE_KEYS.CHATS, [])
    const existingChat = storedChats.find(chat => {
      const participants = chat.participants || []
      // Check if both users are participants (order doesn't matter)
      return participants.length === 2 && 
             participants.includes(user.id) && 
             participants.includes(userId)
    })
    
    if (existingChat) {
      // Found existing chat - set it as active and load its messages
      setActiveChat(existingChat)
      
      // Load messages for this chat immediately
      const storedMessages = getStoredData(STORAGE_KEYS.MESSAGES, [])
      const chatMessages = storedMessages
        .filter(m => m.chatId === existingChat.id)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      setMessages(chatMessages)
      
      // Also ensure chat is in user's chat list
      const userChats = storedChats.filter(chat => {
        const participants = chat.participants || []
        return Array.isArray(participants) && participants.includes(user.id)
      })
      const sortedChats = userChats.sort((a, b) => {
        const timeA = new Date(a.lastMessageAt || a.createdAt || 0).getTime()
        const timeB = new Date(b.lastMessageAt || b.createdAt || 0).getTime()
        return timeB - timeA
      })
      setChats(sortedChats)
    } else {
      // Create new chat - this will be visible to both users
      const newChat = {
        id: Date.now().toString(),
        participants: [user.id, userId].sort(), // Sort for consistency
        createdAt: new Date().toISOString(),
        lastMessage: '',
        lastMessageAt: new Date().toISOString(),
      }
      // Save to storage
      addDataItem(STORAGE_KEYS.CHATS, newChat)
      
      // Update chats list
      const updatedChats = [...storedChats, newChat]
      const userChats = updatedChats.filter(chat => {
        const participants = chat.participants || []
        return Array.isArray(participants) && participants.includes(user.id)
      })
      const sortedChats = userChats.sort((a, b) => {
        const timeA = new Date(a.lastMessageAt || a.createdAt || 0).getTime()
        const timeB = new Date(b.lastMessageAt || b.createdAt || 0).getTime()
        return timeB - timeA
      })
      setChats(sortedChats)
      
      // Set as active chat and clear messages (new chat, no messages yet)
      setActiveChat(newChat)
      setMessages([])
    }
  }

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        messages,
        setActiveChat,
        sendMessage,
        startChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

