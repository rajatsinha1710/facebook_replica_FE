import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { FiHome, FiMail, FiLock, FiMoon, FiSun } from 'react-icons/fi'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)

    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || 'Login failed. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50/30 dark:from-secondary-950 dark:via-secondary-900 dark:to-secondary-950 flex items-center justify-center p-4 transition-colors duration-200">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-3 rounded-xl bg-white dark:bg-secondary-800 shadow-lg border border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-all duration-200 z-50"
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
      </button>

      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4 group">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white p-3 rounded-xl shadow-lg shadow-primary-500/20 dark:shadow-primary-500/10 transition-transform group-hover:scale-105">
              <FiHome className="w-8 h-8" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-400 dark:to-primary-500 bg-clip-text text-transparent">
              ConnectHub
            </span>
          </Link>
          <h2 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100">Welcome back!</h2>
          <p className="text-secondary-600 dark:text-secondary-400 mt-2">Sign in to continue to ConnectHub</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-secondary-200 dark:border-secondary-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border border-secondary-200 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 bg-secondary-50 dark:bg-secondary-800/50 text-secondary-900 dark:text-secondary-100 placeholder:text-secondary-400 dark:placeholder:text-secondary-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 border border-secondary-200 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 bg-secondary-50 dark:bg-secondary-800/50 text-secondary-900 dark:text-secondary-100 placeholder:text-secondary-400 dark:placeholder:text-secondary-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 dark:bg-primary-500 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-primary-500/20 dark:shadow-primary-500/10"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-secondary-600 dark:text-secondary-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-secondary-200 dark:border-secondary-800">
            <p className="text-xs text-secondary-500 dark:text-secondary-400 text-center mb-2">Demo Credentials:</p>
            <div className="text-xs text-secondary-600 dark:text-secondary-400 space-y-1 bg-secondary-50 dark:bg-secondary-800/50 p-3 rounded-xl">
              <p><strong>Email:</strong> john@example.com</p>
              <p><strong>Password:</strong> password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

