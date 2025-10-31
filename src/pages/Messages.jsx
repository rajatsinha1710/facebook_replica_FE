import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { mockUsers } from '../api/mockData'
import { formatDistanceToNow } from 'date-fns'
import { FiSend, FiSearch } from 'react-icons/fi'
import { initializeUsers, getStoredData, STORAGE_KEYS } from '../utils/storage'

const Messages = () => {
  const { user } = useAuth()
  const { chats, activeChat, messages, setActiveChat, sendMessage, startChat } = useChat()
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState({})
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, activeChat])

  useEffect(() => {
    // Load users from storage
    const storedUsers = initializeUsers(mockUsers)
    
    const usersMap = {}
    storedUsers.forEach(u => {
      usersMap[u.id] = u
    })
    setUsers(usersMap)

    // Set first chat as active if none selected and chats exist
    if (chats.length > 0 && !activeChat) {
      setActiveChat(chats[0])
    }
  }, [chats, activeChat, setActiveChat])
  
  // When activeChat changes, ensure messages are loaded
  useEffect(() => {
    if (activeChat) {
      // Messages will be loaded by ChatContext when activeChat changes
      // This effect just ensures the UI is ready
    }
  }, [activeChat])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!messageInput.trim() || !activeChat) return

    sendMessage(activeChat.id, messageInput.trim())
    setMessageInput('')
  }

  const getChatParticipant = (chat) => {
    const otherParticipantId = chat.participants.find(id => id !== user?.id)
    if (users[otherParticipantId]) {
      return users[otherParticipantId]
    }
    const storedUsers = getStoredData(STORAGE_KEYS.USERS, [])
    return storedUsers.find(u => u.id === otherParticipantId)
  }

  const getActiveChatParticipant = () => {
    if (!activeChat) return null
    return getChatParticipant(activeChat)
  }

  const filteredChats = chats.filter(chat => {
    const participant = getChatParticipant(chat)
    return participant?.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="h-[calc(100vh-8rem)] bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 flex overflow-hidden backdrop-blur-sm">
      {/* Chat List */}
      <div className="w-1/3 border-r border-secondary-200 dark:border-secondary-800 flex flex-col">
        <div className="p-4 border-b border-secondary-200 dark:border-secondary-800">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">Messages</h2>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-200 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 text-secondary-900 dark:text-secondary-100 placeholder:text-secondary-400 dark:placeholder:text-secondary-500 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length > 0 ? (
            filteredChats.map(chat => {
              const participant = getChatParticipant(chat)
              if (!participant) return null
              return (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  className={`w-full flex items-center space-x-3 p-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors ${
                    activeChat?.id === chat.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <img
                    src={participant.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                    alt={participant.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-secondary-200 dark:ring-secondary-700"
                  />
                  <div className="flex-1 text-left min-w-0">
                    <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 truncate">{participant.name}</h3>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 truncate">{chat.lastMessage || 'No messages yet'}</p>
                  </div>
                  <span className="text-xs text-secondary-500 dark:text-secondary-400">
                    {formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: true })}
                  </span>
                </button>
              )
            })
          ) : (
            <div className="p-8 text-center text-secondary-500 dark:text-secondary-400">
              <p>No messages yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-secondary-200 dark:border-secondary-800 flex items-center justify-between bg-white/50 dark:bg-secondary-900/50">
              <Link
                to={`/profile/${getActiveChatParticipant()?.id}`}
                className="flex items-center space-x-3"
              >
                <img
                  src={getActiveChatParticipant()?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                  alt={getActiveChatParticipant()?.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-secondary-200 dark:ring-secondary-700"
                />
                <div>
                  <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">
                    {getActiveChatParticipant()?.name}
                  </h3>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">Active now</p>
                </div>
              </Link>
            </div>

            {/* Messages */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary-50/50 dark:bg-secondary-800/30"
            >
              {messages
                .filter(m => m.chatId === activeChat.id)
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map(message => {
                  const isOwnMessage = message.senderId === user?.id
                  const sender = isOwnMessage ? user : users[message.senderId]
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          isOwnMessage
                            ? 'bg-primary-600 dark:bg-primary-500 text-white'
                            : 'bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 border border-secondary-200 dark:border-secondary-700'
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-white opacity-75' : 'text-secondary-500 dark:text-secondary-400'
                          }`}
                        >
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-secondary-200 dark:border-secondary-800 bg-white/50 dark:bg-secondary-900/50">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-secondary-200 dark:border-secondary-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 bg-secondary-50 dark:bg-secondary-800/50 text-secondary-900 dark:text-secondary-100 placeholder:text-secondary-400 dark:placeholder:text-secondary-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="bg-primary-600 dark:bg-primary-500 text-white p-3 rounded-full hover:bg-primary-700 dark:hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20 dark:shadow-primary-500/10"
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-secondary-500 dark:text-secondary-400">
            <div className="text-center">
              <p className="text-lg mb-2">Select a conversation</p>
              <p className="text-sm">Choose a chat from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages

