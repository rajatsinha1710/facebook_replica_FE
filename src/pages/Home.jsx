import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { mockPosts, mockUsers } from '../api/mockData'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import { initializePosts, initializeUsers, addPost, updatePost as updatePostStorage } from '../utils/storage'

const Home = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState({})

  useEffect(() => {
    // Initialize posts from localStorage (with fallback to mock data)
    const loadedPosts = initializePosts(mockPosts)
    setPosts(loadedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    
    // Initialize users from localStorage (with fallback to mock data)
    const loadedUsers = initializeUsers(mockUsers)
    const usersMap = {}
    loadedUsers.forEach(u => {
      usersMap[u.id] = u
    })
    setUsers(usersMap)
  }, [])

  // Memoize sorted posts to avoid re-sorting on every render
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [posts])

  const handleNewPost = useCallback((newPost) => {
    // Optimistically update UI first
    setPosts(prev => [newPost, ...prev])
    
    // Then save to localStorage (async, non-blocking)
    setTimeout(() => {
      const updatedPosts = addPost(newPost)
      setPosts(updatedPosts)
    }, 0)
  }, [])

  const handlePostUpdate = useCallback((updatedPost) => {
    // Optimistically update UI first
    setPosts(prev =>
      prev.map(post => (post.id === updatedPost.id ? updatedPost : post))
    )
    
    // Then save to localStorage (async, non-blocking)
    setTimeout(() => {
      const updatedPosts = updatePostStorage(updatedPost.id, updatedPost)
      setPosts(updatedPosts)
    }, 0)
  }, [])

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <CreatePost onPostCreated={handleNewPost} />

      {/* Posts Feed */}
      <div className="space-y-6">
        {sortedPosts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            author={users[post.userId]}
            currentUser={user}
            onUpdate={handlePostUpdate}
          />
        ))}
      </div>

      {sortedPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-secondary-500 dark:text-secondary-400 text-lg">No posts yet. Be the first to share something!</p>
        </div>
      )}
    </div>
  )
}

export default Home

