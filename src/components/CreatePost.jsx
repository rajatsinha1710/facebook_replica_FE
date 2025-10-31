import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FiImage, FiSmile, FiMapPin } from 'react-icons/fi'

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  // Compress image helper
  const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

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
          const compressed = canvas.toDataURL('image/jpeg', quality)
          resolve(compressed)
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setIsUploading(true)
      try {
        // Compress image before preview
        const compressed = await compressImage(file, 1920, 1080, 0.8)
        setImage(file)
        setImagePreview(compressed)
      } catch (error) {
        console.error('Error processing image:', error)
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result)
        }
        reader.readAsDataURL(file)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if ((!content.trim() && !image) || isUploading) return

    const newPost = {
      id: Date.now().toString(),
      userId: user.id,
      content: content.trim(),
      image: imagePreview || null,
      likes: [],
      comments: [],
      shares: 0,
      createdAt: new Date().toISOString(),
    }

    onPostCreated(newPost)
    setContent('')
    setImage(null)
    setImagePreview(null)
  }

  return (
    <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 p-6 backdrop-blur-sm">
      <div className="flex items-start space-x-4">
        <img
          src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
          alt={user?.name}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-secondary-200 dark:ring-secondary-700"
        />
        <form onSubmit={handleSubmit} className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
            className="w-full min-h-[100px] p-4 border border-secondary-200 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 resize-none bg-secondary-50 dark:bg-secondary-800/50 text-secondary-900 dark:text-secondary-100 placeholder:text-secondary-400 dark:placeholder:text-secondary-500 transition-all"
          />

          {imagePreview && (
            <div className="mt-4 relative group">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-96 object-cover rounded-xl border border-secondary-200 dark:border-secondary-700"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null)
                  setImagePreview(null)
                }}
                className="absolute top-3 right-3 bg-red-500 dark:bg-red-600 text-white rounded-full p-2 hover:bg-red-600 dark:hover:bg-red-700 shadow-lg transition-all opacity-0 group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <FiImage className="w-5 h-5" />
                <span className="text-sm font-medium">Photo</span>
              </label>
              <button
                type="button"
                className="flex items-center space-x-2 text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <FiSmile className="w-5 h-5" />
                <span className="text-sm font-medium">Feeling</span>
              </button>
              <button
                type="button"
                className="flex items-center space-x-2 text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <FiMapPin className="w-5 h-5" />
                <span className="text-sm font-medium">Location</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={(!content.trim() && !image) || isUploading}
              className="bg-primary-600 dark:bg-primary-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20 dark:shadow-primary-500/10"
            >
              {isUploading ? 'Processing...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePost

