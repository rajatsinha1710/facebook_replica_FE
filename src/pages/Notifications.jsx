import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'
import { mockUsers } from '../api/mockData'
import { formatDistanceToNow } from 'date-fns'
import { FiHeart, FiMessageCircle, FiUserPlus, FiShare2, FiCheck } from 'react-icons/fi'
import { initializeUsers, updateUser as updateUserStorage, getStoredData, STORAGE_KEYS } from '../utils/storage'

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications()
  const { user, updateUser } = useAuth()
  const [users, setUsers] = useState({})

  const handleAcceptFriendRequest = (fromUserId) => {
    // Update current user's friends list
    const updatedFriends = [...(user?.friends || []), fromUserId]
    updateUser({ friends: updatedFriends })

    // Update the other user's friends list (mutual friendship) in storage
    const storedUsers = getStoredData(STORAGE_KEYS.USERS, [])
    const otherUser = storedUsers.find(u => u.id === fromUserId)
    if (otherUser) {
      const otherUserFriends = [...(otherUser.friends || [])]
      if (!otherUserFriends.includes(user?.id)) {
        otherUserFriends.push(user?.id)
        updateUserStorage(fromUserId, { friends: otherUserFriends })
      }
    }
  }

  useEffect(() => {
    // Load users from storage
    const storedUsers = initializeUsers(mockUsers)
    const usersMap = {}
    storedUsers.forEach(u => {
      usersMap[u.id] = u
    })
    setUsers(usersMap)
  }, [])

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <FiHeart className="w-5 h-5 text-red-500" />
      case 'comment':
        return <FiMessageCircle className="w-5 h-5 text-blue-500" />
      case 'friend_request':
        return <FiUserPlus className="w-5 h-5 text-green-500" />
      case 'share':
        return <FiShare2 className="w-5 h-5 text-purple-500" />
      default:
        return <FiCheck className="w-5 h-5 text-gray-500" />
    }
  }

  const getNotificationText = (notification) => {
    const user = users[notification.fromUserId]
    if (!user) return 'Someone'

    switch (notification.type) {
      case 'like':
        return `${user.name} liked your post`
      case 'comment':
        return `${user.name} commented on your post`
      case 'friend_request':
        return `${user.name} sent you a friend request`
      case 'share':
        return `${user.name} shared your post`
      default:
        return `${user.name} interacted with you`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 p-6 flex items-center justify-between backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">Notifications</h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20 dark:shadow-primary-500/10"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 overflow-hidden backdrop-blur-sm">
        {notifications.length > 0 ? (
          <div className="divide-y divide-secondary-200 dark:divide-secondary-800">
            {notifications.map(notification => {
              const user = users[notification.fromUserId]
              if (!user) return null

              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors ${
                    !notification.read ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <Link
                    to={notification.postId ? `/profile/${user.id}` : `/profile/${user.id}`}
                    className="flex items-start space-x-4"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <img
                      src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-secondary-200 dark:ring-secondary-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            {getNotificationIcon(notification.type)}
                            <p className="text-secondary-900 dark:text-secondary-100">
                              <span className="font-semibold">{user.name}</span>{' '}
                              {getNotificationText(notification).replace(user.name, '').trim()}
                            </p>
                          </div>
                          {notification.type === 'comment' && notification.postId && (
                            <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">View post</p>
                          )}
                          {notification.type === 'friend_request' && (
                            <div className="flex items-center space-x-2 mt-2">
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleAcceptFriendRequest(notification.fromUserId)
                                  markAsRead(notification.id)
                                }}
                                className="bg-primary-600 dark:bg-primary-500 text-white px-4 py-1 rounded-xl text-sm font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20 dark:shadow-primary-500/10"
                              >
                                Accept
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  markAsRead(notification.id)
                                }}
                                className="bg-secondary-200 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 px-4 py-1 rounded-xl text-sm font-semibold hover:bg-secondary-300 dark:hover:bg-secondary-600 transition-colors"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-secondary-500 dark:text-secondary-400">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary-600 dark:bg-primary-500 rounded-full mt-2 ml-auto" />
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-secondary-500 dark:text-secondary-400">
            <p className="text-lg mb-2">No notifications</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications

