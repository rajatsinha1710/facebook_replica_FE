import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { mockUsers } from '../api/mockData'

const CommentSection = ({ post, currentUser, onComment }) => {
  const [newComment, setNewComment] = useState('')
  const [users, setUsers] = useState({})

  useEffect(() => {
    const usersMap = {}
    mockUsers.forEach(u => {
      usersMap[u.id] = u
    })
    setUsers(usersMap)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const comment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
    }

    onComment(comment)
    setNewComment('')
  }

  return (
    <div className="px-5 py-4 border-t border-secondary-200 dark:border-secondary-800 bg-secondary-50/50 dark:bg-secondary-800/30">
      {/* Existing Comments */}
      {post.comments && post.comments.length > 0 && (
        <div className="space-y-3 mb-4">
          {post.comments.map((comment) => {
            const commentAuthor = users[comment.userId] || mockUsers.find(u => u.id === comment.userId)
            if (!commentAuthor) return null

            return (
              <div key={comment.id} className="flex items-start space-x-3">
                <Link to={`/profile/${commentAuthor.id}`}>
                  <img
                    src={commentAuthor.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                    alt={commentAuthor.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-secondary-200 dark:ring-secondary-700"
                  />
                </Link>
                <div className="flex-1 bg-white dark:bg-secondary-800 rounded-xl p-3 border border-secondary-200 dark:border-secondary-700">
                  <Link
                    to={`/profile/${commentAuthor.id}`}
                    className="font-semibold text-secondary-900 dark:text-secondary-100 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors"
                  >
                    {commentAuthor.name}
                  </Link>
                  <p className="text-secondary-800 dark:text-secondary-200 mt-1 leading-relaxed">{comment.content}</p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1.5">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <img
          src={currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
          alt={currentUser?.name}
          className="w-9 h-9 rounded-full object-cover ring-2 ring-secondary-200 dark:ring-secondary-700"
        />
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 text-secondary-900 dark:text-secondary-100 placeholder:text-secondary-400 dark:placeholder:text-secondary-500 transition-all"
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="bg-primary-600 dark:bg-primary-500 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20 dark:shadow-primary-500/10"
        >
          Post
        </button>
      </form>
    </div>
  )
}

export default CommentSection

