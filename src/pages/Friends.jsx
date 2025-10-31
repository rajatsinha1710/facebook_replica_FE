import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { mockUsers } from '../api/mockData'
import { FiUserPlus, FiCheck, FiX, FiSearch, FiMessageCircle } from 'react-icons/fi'
import { initializeUsers, getStoredData, updateUser as updateUserStorage, STORAGE_KEYS } from '../utils/storage'

const Friends = () => {
  const { user, updateUser } = useAuth()
  const { startChat } = useChat()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all') // all, requests, suggestions
  const [searchQuery, setSearchQuery] = useState('')
  const [friends, setFriends] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    // Load users from storage
    const storedUsers = initializeUsers(mockUsers)
    
    // Get friends
    const friendsList = storedUsers.filter(u => user?.friends?.includes(u.id))
    setFriends(friendsList)

    // Get friend requests (simulated)
    const requests = storedUsers
      .filter(u => u.id !== user?.id && !user?.friends?.includes(u.id))
      .slice(0, 3)
      .map(u => ({ ...u, requestId: `req_${u.id}` }))
    setFriendRequests(requests)

    // Get suggestions
    const suggestionsList = storedUsers
      .filter(u => u.id !== user?.id && !user?.friends?.includes(u.id))
      .slice(0, 6)
    setSuggestions(suggestionsList)
  }, [user])

  const handleAcceptRequest = (requestId) => {
    const request = friendRequests.find(r => r.requestId === requestId)
    if (!request) return

    // Update current user's friends list
    const updatedFriends = [...(user?.friends || []), request.id]
    updateUser({ friends: updatedFriends })

    // Update the other user's friends list (mutual friendship) in storage
    const storedUsers = getStoredData(STORAGE_KEYS.USERS, [])
    const otherUser = storedUsers.find(u => u.id === request.id)
    if (otherUser) {
      const otherUserFriends = [...(otherUser.friends || [])]
      if (!otherUserFriends.includes(user?.id)) {
        otherUserFriends.push(user?.id)
        updateUserStorage(request.id, { friends: otherUserFriends })
      }
    }

    // Remove from requests and suggestions
    setFriendRequests(prev => prev.filter(r => r.requestId !== requestId))
    setSuggestions(prev => prev.filter(p => p.id !== request.id))
    
    // Update friends list immediately
    const storedUsersUpdated = getStoredData(STORAGE_KEYS.USERS, [])
    const updatedFriendsList = storedUsersUpdated.filter(u => updatedFriends.includes(u.id))
    setFriends(updatedFriendsList)
  }

  const handleRejectRequest = (requestId) => {
    setFriendRequests(prev => prev.filter(r => r.requestId !== requestId))
  }

  const handleStartChat = (userId) => {
    if (!userId || userId === user?.id) return
    startChat(userId)
    navigate('/messages')
  }

  const handleSendRequest = (userId) => {
    // Remove from suggestions and add to requests (simulated)
    setSuggestions(prev => prev.filter(p => p.id !== userId))
    alert('Friend request sent!')
  }

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 p-6 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">Friends</h1>
        <p className="text-secondary-600 dark:text-secondary-400">{user?.friends?.length || friends.length} friends</p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 backdrop-blur-sm">
        <div className="flex border-b border-secondary-200 dark:border-secondary-800">
            <button
              onClick={() => {
                setActiveTab('all')
                // Refresh friends list when switching to all tab
                const storedUsers = getStoredData(STORAGE_KEYS.USERS, [])
                const friendsList = storedUsers.filter(u => user?.friends?.includes(u.id))
                setFriends(friendsList)
              }}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'all'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100'
              }`}
            >
              All Friends ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'requests'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100'
              }`}
            >
              Friend Requests ({friendRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'suggestions'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100'
              }`}
            >
              Suggestions ({suggestions.length})
            </button>
        </div>

        {/* Search */}
        {activeTab === 'all' && (
          <div className="p-4 border-b border-secondary-200 dark:border-secondary-800">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-200 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 text-secondary-900 dark:text-secondary-100 placeholder:text-secondary-400 dark:placeholder:text-secondary-500 transition-all"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {activeTab === 'all' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFriends.length > 0 ? (
                filteredFriends.map(friend => (
                  <div
                    key={friend.id}
                    className="bg-secondary-50 dark:bg-secondary-800/50 rounded-2xl p-4 border border-secondary-200 dark:border-secondary-700"
                  >
                    <Link
                      to={`/profile/${friend.id}`}
                      className="block group"
                    >
                      <img
                        src={friend.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                        alt={friend.name}
                        className="w-full aspect-square rounded-xl object-cover mb-3 group-hover:opacity-90 transition-opacity"
                      />
                      <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-3">
                        {friend.name}
                      </h3>
                    </Link>
                    <button
                      onClick={() => handleStartChat(friend.id)}
                      className="w-full flex items-center justify-center space-x-2 bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20 dark:shadow-primary-500/10"
                    >
                      <FiMessageCircle className="w-5 h-5" />
                      <span>Message</span>
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-secondary-500 dark:text-secondary-400 col-span-full text-center py-8">
                  {searchQuery ? 'No friends found' : 'No friends yet'}
                </p>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {friendRequests.length > 0 ? (
                friendRequests.map(request => (
                  <div
                    key={request.requestId}
                    className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-2xl border border-secondary-200 dark:border-secondary-700"
                  >
                    <Link
                      to={`/profile/${request.id}`}
                      className="flex items-center space-x-4 flex-1"
                    >
                      <img
                        src={request.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                        alt={request.name}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-secondary-200 dark:ring-secondary-700"
                      />
                      <div>
                        <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">{request.name}</h3>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">Sent you a friend request</p>
                      </div>
                    </Link>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAcceptRequest(request.requestId)}
                        className="flex items-center space-x-2 bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20 dark:shadow-primary-500/10"
                      >
                        <FiCheck className="w-5 h-5" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.requestId)}
                        className="p-2 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700 rounded-xl transition-colors"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-secondary-500 dark:text-secondary-400 text-center py-8">No friend requests</p>
              )}
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map(person => (
                <div
                  key={person.id}
                  className="bg-secondary-50 dark:bg-secondary-800/50 rounded-2xl p-4 border border-secondary-200 dark:border-secondary-700"
                >
                  <Link to={`/profile/${person.id}`}>
                    <img
                      src={person.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                      alt={person.name}
                      className="w-full aspect-square rounded-xl object-cover mb-3"
                    />
                    <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-1">{person.name}</h3>
                  </Link>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3">{person.bio || 'No bio'}</p>
                  <button
                    onClick={() => handleSendRequest(person.id)}
                    className="w-full flex items-center justify-center space-x-2 bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20 dark:shadow-primary-500/10"
                  >
                    <FiUserPlus className="w-5 h-5" />
                    <span>Add Friend</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Friends

