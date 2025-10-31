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
    const userChats = storedChats.filter(
      chat => chat.participants.includes(user.id)
    )
    setChats(userChats)

    // Load messages from storage
    const storedMessages = getStoredData(STORAGE_KEYS.MESSAGES, mockMessages)
    
    // Get messages for all user's chats
    const userMessages = storedMessages.filter(
      m => userChats.some(chat => chat.id === m.chatId)
    )
    setMessages(userMessages)

    // If there's an active chat, filter messages for it
    if (activeChat) {
      const chatMessages = storedMessages.filter(
        m => m.chatId === activeChat.id
      )
      setMessages(chatMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)))
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
      const storedMessages = getStoredData(STORAGE_KEYS.MESSAGES, [])
      const chatMessages = storedMessages.filter(
        m => m.chatId === activeChat.id
      )
      setMessages(chatMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)))
    }
  }, [activeChat, user])

  const sendMessage = (chatId, content) => {
    if (!user) return
    
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
    const storedChats = getStoredData(STORAGE_KEYS.CHATS, [])
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
    const storedChats = getStoredData(STORAGE_KEYS.CHATS, [])
    const existingChat = storedChats.find(chat => {
      const participants = chat.participants || []
      return participants.length === 2 && 
             participants.includes(user.id) && 
             participants.includes(userId)
    })
    
    if (existingChat) {
      setActiveChat(existingChat)
      // Ensure chat is in current user's chat list
      if (!chats.find(c => c.id === existingChat.id)) {
        setChats(prev => [...prev, existingChat])
      }
    } else {
      // Create new chat - this will be visible to both users
      const newChat = {
        id: Date.now().toString(),
        participants: [user.id, userId],
        createdAt: new Date().toISOString(),
        lastMessage: '',
        lastMessageAt: new Date().toISOString(),
      }
      // Save to storage
      addDataItem(STORAGE_KEYS.CHATS, newChat)
      setChats(prev => [...prev, newChat])
      setActiveChat(newChat)
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

