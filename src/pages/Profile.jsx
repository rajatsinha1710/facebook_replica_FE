import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mockUsers, mockPosts } from '../api/mockData'
import PostCard from '../components/PostCard'
import { FiMapPin, FiBriefcase, FiBook, FiCalendar, FiUserPlus, FiCheck, FiX, FiCamera } from 'react-icons/fi'
import { initializeUsers, initializePosts, getStoredData, STORAGE_KEYS, updatePost as updatePostStorage, updateUser as updateUserStorage } from '../utils/storage'

const Profile = () => {
  const { userId } = useParams()
  const { user: currentUser, updateUser } = useAuth()
  const [profileUser, setProfileUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState({})
  const [isFriend, setIsFriend] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCoverPhotoModal, setShowCoverPhotoModal] = useState(false)
  const [editFormData, setEditFormData] = useState({
    bio: '',
    location: '',
    workplace: '',
    education: '',
    birthday: '',
  })
  const [coverPhotoPreview, setCoverPhotoPreview] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Load from storage
    const storedUsers = initializeUsers(mockUsers)
    const storedPosts = getStoredData(STORAGE_KEYS.POSTS, mockPosts)
    
    const targetUserId = userId || currentUser?.id
    const user = storedUsers.find(u => u.id === targetUserId) || currentUser
    setProfileUser(user)

    // Initialize edit form data when profile user changes
    if (user) {
      setEditFormData({
        bio: user.bio || '',
        location: user.location || '',
        workplace: user.workplace || '',
        education: user.education || '',
        birthday: user.birthday || '',
      })
    }

    const usersMap = {}
    storedUsers.forEach(u => {
      usersMap[u.id] = u
    })
    setUsers(usersMap)

    // Check if current user is friend
    if (user && currentUser) {
      const isCurrentlyFriend = currentUser.friends?.includes(user.id) || false
      setIsFriend(isCurrentlyFriend)
    }

    // Load user's posts from storage
    const userPosts = storedPosts.filter(p => p.userId === targetUserId)
    setPosts(userPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
  }, [userId, currentUser])

  const handleFriendRequest = () => {
    // Simulate friend request sent
    alert('Friend request sent!')
    // Note: This would normally add the request to the other user's friendRequests array
  }

  const handlePostUpdate = (updatedPost) => {
    // Save to storage
    updatePostStorage(updatedPost.id, updatedPost)
    setPosts(prev =>
      prev.map(post => (post.id === updatedPost.id ? updatedPost : post))
    )
  }

  // Helper function to compress image
  const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width)
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height)
              height = maxHeight
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          // Convert to base64 with compression
          const compressed = canvas.toDataURL('image/jpeg', quality)
          resolve(compressed)
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handleCoverPhotoChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        // Compress image before preview (max 1920x1080 for cover photo)
        const compressed = await compressImage(file, 1920, 1080, 0.8)
        setCoverPhotoPreview(compressed)
      } catch (error) {
        console.error('Error processing cover photo:', error)
        // Fallback to original if compression fails
        const reader = new FileReader()
        reader.onloadend = () => {
          setCoverPhotoPreview(reader.result)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        // Compress image before preview (max 400x400 for avatar, higher quality)
        const compressed = await compressImage(file, 400, 400, 0.9)
        setAvatarPreview(compressed)
      } catch (error) {
        console.error('Error processing avatar:', error)
        // Fallback to original if compression fails
        const reader = new FileReader()
        reader.onloadend = () => {
          setAvatarPreview(reader.result)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const handleSaveCoverPhoto = async () => {
    if (coverPhotoPreview && currentUser && !isSaving) {
      setIsSaving(true)
      try {
        // Use requestIdleCallback to defer heavy localStorage operations
        const saveOperation = () => {
          updateUser({ coverPhoto: coverPhotoPreview })
          updateUserStorage(currentUser.id, { coverPhoto: coverPhotoPreview })
          setProfileUser({ ...profileUser, coverPhoto: coverPhotoPreview })
          setShowCoverPhotoModal(false)
          setCoverPhotoPreview(null)
          setIsSaving(false)
          alert('Cover photo updated successfully!')
        }

        // Use requestIdleCallback if available, otherwise use setTimeout
        if (window.requestIdleCallback) {
          requestIdleCallback(saveOperation, { timeout: 1000 })
        } else {
          setTimeout(saveOperation, 100)
        }
      } catch (error) {
        console.error('Error saving cover photo:', error)
        setIsSaving(false)
        alert('Error saving cover photo. Please try again.')
      }
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (currentUser && !isSaving) {
      setIsSaving(true)
      try {
        const updates = { ...editFormData }
        if (avatarPreview) {
          updates.avatar = avatarPreview
        }
        
        // Use requestIdleCallback to defer heavy localStorage operations
        const saveOperation = () => {
          updateUser(updates)
          updateUserStorage(currentUser.id, updates)
          setProfileUser({ ...profileUser, ...updates })
          setShowEditModal(false)
          setAvatarPreview(null)
          setIsSaving(false)
          alert('Profile updated successfully!')
        }

        // Use requestIdleCallback if available, otherwise use setTimeout
        if (window.requestIdleCallback) {
          requestIdleCallback(saveOperation, { timeout: 1000 })
        } else {
          setTimeout(saveOperation, 100)
        }
      } catch (error) {
        console.error('Error saving profile:', error)
        setIsSaving(false)
        alert('Error saving profile. Please try again.')
      }
    }
  }

  const handleFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    })
  }

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const isOwnProfile = profileUser.id === currentUser?.id

  return (
    <div className="space-y-6">
      {/* Cover Photo */}
      <div className="relative h-64 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl overflow-hidden">
        <img
          src={profileUser.coverPhoto || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=400&fit=crop'}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        {isOwnProfile && (
          <button 
            onClick={() => setShowCoverPhotoModal(true)}
            className="absolute top-4 right-4 bg-white dark:bg-secondary-800 bg-opacity-90 dark:bg-opacity-90 text-secondary-900 dark:text-secondary-100 px-4 py-2 rounded-xl font-semibold hover:bg-opacity-100 dark:hover:bg-opacity-100 transition-all shadow-lg flex items-center space-x-2"
          >
            <FiCamera className="w-4 h-4" />
            <span>Edit Cover Photo</span>
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 p-6 -mt-20 relative z-10 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between">
          <div className="flex items-end space-x-6">
            <img
              src={profileUser.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
              alt={profileUser.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-secondary-900 shadow-lg"
            />
            <div className="pb-4">
              <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">{profileUser.name}</h1>
              <p className="text-secondary-600 dark:text-secondary-400 mt-1">{profileUser.bio || 'No bio yet'}</p>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-secondary-600 dark:text-secondary-400">
                {profileUser.location && (
                  <div className="flex items-center space-x-1">
                    <FiMapPin className="w-4 h-4" />
                    <span>{profileUser.location}</span>
                  </div>
                )}
                {profileUser.workplace && (
                  <div className="flex items-center space-x-1">
                    <FiBriefcase className="w-4 h-4" />
                    <span>{profileUser.workplace}</span>
                  </div>
                )}
                {profileUser.education && (
                  <div className="flex items-center space-x-1">
                    <FiBook className="w-4 h-4" />
                    <span>{profileUser.education}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {!isOwnProfile && (
            <div className="mt-4 md:mt-0">
              {isFriend ? (
                <button className="flex items-center space-x-2 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 px-6 py-2 rounded-xl font-semibold hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors">
                  <FiCheck className="w-5 h-5" />
                  <span>Friends</span>
                </button>
              ) : (
                <button
                  onClick={handleFriendRequest}
                  className="flex items-center space-x-2 bg-primary-600 dark:bg-primary-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 dark:shadow-primary-500/10"
                >
                  <FiUserPlus className="w-5 h-5" />
                  <span>Add Friend</span>
                </button>
              )}
            </div>
          )}
          {isOwnProfile && (
            <button 
              onClick={() => setShowEditModal(true)}
              className="mt-4 md:mt-0 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 px-6 py-2 rounded-xl font-semibold hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* About Section */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">About</h2>
            <div className="space-y-4">
              {profileUser.bio && (
                <div>
                  <p className="text-secondary-900 dark:text-secondary-100">{profileUser.bio}</p>
                </div>
              )}
              {profileUser.location && (
                <div className="flex items-start space-x-3">
                  <FiMapPin className="w-5 h-5 text-secondary-400 dark:text-secondary-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-secondary-700 dark:text-secondary-300">Location</p>
                    <p className="text-secondary-600 dark:text-secondary-400">{profileUser.location}</p>
                  </div>
                </div>
              )}
              {profileUser.workplace && (
                <div className="flex items-start space-x-3">
                  <FiBriefcase className="w-5 h-5 text-secondary-400 dark:text-secondary-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-secondary-700 dark:text-secondary-300">Work</p>
                    <p className="text-secondary-600 dark:text-secondary-400">{profileUser.workplace}</p>
                  </div>
                </div>
              )}
              {profileUser.education && (
                <div className="flex items-start space-x-3">
                  <FiBook className="w-5 h-5 text-secondary-400 dark:text-secondary-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-secondary-700 dark:text-secondary-300">Education</p>
                    <p className="text-secondary-600 dark:text-secondary-400">{profileUser.education}</p>
                  </div>
                </div>
              )}
              {profileUser.birthday && (
                <div className="flex items-start space-x-3">
                  <FiCalendar className="w-5 h-5 text-secondary-400 dark:text-secondary-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-secondary-700 dark:text-secondary-300">Birthday</p>
                    <p className="text-secondary-600 dark:text-secondary-400">
                      {new Date(profileUser.birthday).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Friends Section */}
          <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 p-6 mt-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100">Friends</h2>
              <Link
                to="/friends"
                className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium transition-colors"
              >
                See all
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {profileUser.friends?.slice(0, 9).map((friendId) => {
                const friend = users[friendId] || mockUsers.find(u => u.id === friendId)
                if (!friend) return null
                return (
                  <Link
                    key={friendId}
                    to={`/profile/${friendId}`}
                    className="text-center group"
                  >
                    <img
                      src={friend.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                      alt={friend.name}
                      className="w-full aspect-square rounded-lg object-cover group-hover:opacity-80 transition-opacity"
                    />
                    <p className="text-xs text-secondary-700 dark:text-secondary-300 mt-2 truncate">{friend.name}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">Posts</h2>
            {posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    author={users[post.userId] || profileUser}
                    currentUser={currentUser}
                    onUpdate={handlePostUpdate}
                  />
                ))}
              </div>
            ) : (
              <p className="text-secondary-500 dark:text-secondary-400 text-center py-8">No posts yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Cover Photo Modal */}
      {showCoverPhotoModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100">Edit Cover Photo</h2>
              <button
                onClick={() => {
                  setShowCoverPhotoModal(false)
                  setCoverPhotoPreview(null)
                }}
                className="text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Choose a new cover photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverPhotoChange}
                  className="w-full px-4 py-2 border border-secondary-200 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 bg-secondary-50 dark:bg-secondary-800/50 text-secondary-900 dark:text-secondary-100 transition-all"
                />
              </div>

              {coverPhotoPreview && (
                <div className="relative h-48 rounded-xl overflow-hidden border border-secondary-200 dark:border-secondary-700">
                  <img
                    src={coverPhotoPreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCoverPhotoModal(false)
                    setCoverPhotoPreview(null)
                  }}
                  className="flex-1 px-4 py-2 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-xl font-semibold hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCoverPhoto}
                  disabled={!coverPhotoPreview || isSaving}
                  className="flex-1 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 dark:shadow-primary-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100">Edit Profile</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setAvatarPreview(null)
                }}
                className="text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={avatarPreview || profileUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover border-4 border-secondary-200 dark:border-secondary-700"
                    />
                    <label className="absolute bottom-0 right-0 bg-primary-600 dark:bg-primary-500 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors">
                      <FiCamera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">Click camera icon to change</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={editFormData.bio}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-secondary-200 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 bg-secondary-50 dark:bg-secondary-800/50 text-secondary-900 dark:text-secondary-100 transition-all resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={editFormData.location}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-secondary-200 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 bg-secondary-50 dark:bg-secondary-800/50 text-secondary-900 dark:text-secondary-100 transition-all"
                  placeholder="City, State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Workplace
                </label>
                <input
                  type="text"
                  name="workplace"
                  value={editFormData.workplace}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-secondary-200 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 bg-secondary-50 dark:bg-secondary-800/50 text-secondary-900 dark:text-secondary-100 transition-all"
                  placeholder="Company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Education
                </label>
                <input
                  type="text"
                  name="education"
                  value={editFormData.education}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-secondary-200 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 bg-secondary-50 dark:bg-secondary-800/50 text-secondary-900 dark:text-secondary-100 transition-all"
                  placeholder="School/University"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Birthday
                </label>
                <input
                  type="date"
                  name="birthday"
                  value={editFormData.birthday}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-secondary-200 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 bg-secondary-50 dark:bg-secondary-800/50 text-secondary-900 dark:text-secondary-100 transition-all"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setAvatarPreview(null)
                  }}
                  className="flex-1 px-4 py-2 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-xl font-semibold hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 dark:shadow-primary-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile

