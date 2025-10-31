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

  useEffect(() => {
    if (user) {
      // Initialize chats and messages from storage
      const storedChats = initializeData(STORAGE_KEYS.CHATS, mockChats)
      
      // Filter chats for current user
      const userChats = storedChats.filter(
        chat => chat.participants.includes(user.id)
      )
      setChats(userChats)

      // Load messages from storage
      const storedMessages = getStoredData(STORAGE_KEYS.MESSAGES, mockMessages)
      const userMessages = storedMessages.filter(
        m => userChats.some(chat => chat.id === m.chatId)
      )
      setMessages(userMessages)

      if (activeChat) {
        const chatMessages = userMessages.filter(
          m => m.chatId === activeChat.id
        )
        setMessages(chatMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)))
      }
    }
  }, [user])

  useEffect(() => {
    if (activeChat && user) {
      const storedMessages = getStoredData(STORAGE_KEYS.MESSAGES, mockMessages)
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
    setMessages(prev => [...prev, newMessage])
    
    // Update chat last message in storage
    const storedChats = getStoredData(STORAGE_KEYS.CHATS, [])
    const updatedChats = storedChats.map(chat =>
      chat.id === chatId
        ? { ...chat, lastMessage: content, lastMessageAt: newMessage.createdAt }
        : chat
    )
    saveStoredData(STORAGE_KEYS.CHATS, updatedChats)
    setChats(updatedChats.filter(chat => chat.participants.includes(user.id)))

    // Simulate receiving a response after 1-2 seconds
    setTimeout(() => {
      const response = {
        id: (Date.now() + 1).toString(),
        chatId,
        senderId: activeChat?.participants.find(id => id !== user.id),
        content: 'Thanks for your message!',
        createdAt: new Date().toISOString(),
        read: false,
      }
      const updatedMessagesWithResponse = [...updatedMessages, response]
      saveStoredData(STORAGE_KEYS.MESSAGES, updatedMessagesWithResponse)
      setMessages(prev => [...prev, response])
    }, 1000 + Math.random() * 1000)
  }

  const startChat = (userId) => {
    if (!user) return
    
    const existingChat = chats.find(chat =>
      chat.participants.includes(userId) && chat.participants.length === 2
    )
    
    if (existingChat) {
      setActiveChat(existingChat)
    } else {
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

