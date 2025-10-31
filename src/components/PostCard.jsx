import { useState, useMemo, useCallback, memo } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { FiHeart, FiMessageCircle, FiShare2, FiMoreHorizontal } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import CommentSection from './CommentSection'

const PostCard = memo(({ post, author, currentUser, onUpdate }) => {
  const [showComments, setShowComments] = useState(false)
  
  // Memoize computed values
  const isLiked = useMemo(() => post.likes?.includes(currentUser?.id) || false, [post.likes, currentUser?.id])
  const likeCount = useMemo(() => post.likes?.length || 0, [post.likes?.length])

  const handleLike = useCallback(() => {
    const newIsLiked = !isLiked
    let newLikes = [...(post.likes || [])]
    if (newIsLiked) {
      newLikes.push(currentUser.id)
    } else {
      newLikes = newLikes.filter(id => id !== currentUser.id)
    }
    
    // Optimistically update
    onUpdate({
      ...post,
      likes: newLikes,
    })
  }, [isLiked, post, currentUser?.id, onUpdate])

  const handleComment = useCallback((comment) => {
    const newComments = [...(post.comments || []), comment]
    onUpdate({
      ...post,
      comments: newComments,
    })
  }, [post, onUpdate])

  const handleShare = useCallback(() => {
    onUpdate({
      ...post,
      shares: (post.shares || 0) + 1,
    })
  }, [post, onUpdate])
  
  const formattedTime = useMemo(() => {
    return formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
  }, [post.createdAt])

  if (!author) return null

  return (
    <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 overflow-hidden backdrop-blur-sm">
      {/* Post Header */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <Link
            to={`/profile/${author.id}`}
            className="flex items-center space-x-3 flex-1 group"
          >
            <img
              src={author.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
              alt={author.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-secondary-200 dark:ring-secondary-700 group-hover:ring-primary-500 dark:group-hover:ring-primary-400 transition-all"
            />
            <div>
              <p className="font-semibold text-secondary-900 dark:text-secondary-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {author.name}
              </p>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">
                {formattedTime}
              </p>
            </div>
          </Link>
          <button className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-xl transition-colors">
            <FiMoreHorizontal className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
          </button>
        </div>
      </div>

      {/* Post Content */}
      {post.content && (
        <div className="px-5 pb-5">
          <p className="text-secondary-900 dark:text-secondary-100 whitespace-pre-wrap leading-relaxed">{post.content}</p>
        </div>
      )}

      {/* Post Image */}
      {post.image && (
        <div className="w-full">
          <img
            src={post.image}
            alt="Post"
            className="w-full max-h-[600px] object-cover"
          />
        </div>
      )}

      {/* Post Stats */}
      <div className="px-5 py-3 border-t border-secondary-200 dark:border-secondary-800">
        <div className="flex items-center justify-between text-sm text-secondary-600 dark:text-secondary-400">
          <div className="flex items-center space-x-4">
            {likeCount > 0 && (
              <span className="flex items-center space-x-1.5">
                <FaHeart className="w-4 h-4 text-red-500 dark:text-red-400" />
                <span className="font-medium">{likeCount}</span>
              </span>
            )}
            {post.comments?.length > 0 && (
              <span className="font-medium">{post.comments.length} comments</span>
            )}
            {post.shares > 0 && <span className="font-medium">{post.shares} shares</span>}
          </div>
        </div>
      </div>

      {/* Post Actions */}
      <div className="px-5 py-2 border-t border-secondary-200 dark:border-secondary-800">
        <div className="flex items-center justify-around">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all flex-1 justify-center ${
              isLiked
                ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800'
            }`}
          >
            {isLiked ? (
              <FaHeart className="w-5 h-5" />
            ) : (
              <FiHeart className="w-5 h-5" />
            )}
            <span className="font-medium">Like</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all flex-1 justify-center"
          >
            <FiMessageCircle className="w-5 h-5" />
            <span className="font-medium">Comment</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all flex-1 justify-center"
          >
            <FiShare2 className="w-5 h-5" />
            <span className="font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <CommentSection
          post={post}
          currentUser={currentUser}
          onComment={handleComment}
        />
      )}
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for memo
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.likes?.length === nextProps.post.likes?.length &&
    prevProps.post.comments?.length === nextProps.post.comments?.length &&
    prevProps.post.shares === nextProps.post.shares &&
    prevProps.currentUser?.id === nextProps.currentUser?.id &&
    prevProps.author?.id === nextProps.author?.id
  )
})

PostCard.displayName = 'PostCard'

export default PostCard

