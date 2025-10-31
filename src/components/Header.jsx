import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { useTheme } from '../context/ThemeContext'
import { FiHome, FiSearch, FiBell, FiMessageCircle, FiSettings, FiLogOut, FiUser, FiMoon, FiSun } from 'react-icons/fi'
import { IoIosArrowDown } from 'react-icons/io'

const Header = () => {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-secondary-900/80 backdrop-blur-lg border-b border-secondary-200 dark:border-secondary-800 z-50 shadow-sm dark:shadow-secondary-900/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center space-x-3 group">
            <div className="relative transition-transform group-hover:scale-105">
              <img 
                src="/logo.svg" 
                alt="ConnectHub Logo" 
                className="w-10 h-10"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-400 dark:to-primary-500 bg-clip-text text-transparent hidden sm:block">
              ConnectHub
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search ConnectHub..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-200 dark:border-secondary-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 dark:focus:border-primary-400 transition-all placeholder:text-secondary-400 dark:placeholder:text-secondary-500 text-secondary-900 dark:text-secondary-100"
              />
            </div>
          </form>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-2">
            <Link
              to="/home"
              className="relative p-2.5 text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-xl transition-all duration-200"
              title="Home"
            >
              <FiHome className="w-5 h-5" />
            </Link>

            <Link
              to="/messages"
              className="relative p-2.5 text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-xl transition-all duration-200"
              title="Messages"
            >
              <FiMessageCircle className="w-5 h-5" />
            </Link>

            <Link
              to="/notifications"
              className="relative p-2.5 text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-xl transition-all duration-200"
              title="Notifications"
            >
              <FiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 dark:bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-xl transition-all duration-200"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>

            <Link
              to="/settings"
              className="p-2.5 text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-xl transition-all duration-200"
              title="Settings"
            >
              <FiSettings className="w-5 h-5" />
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all duration-200 border border-transparent hover:border-secondary-200 dark:hover:border-secondary-700"
              >
                <img
                  src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                  alt={user?.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-secondary-200 dark:ring-secondary-700"
                />
                <IoIosArrowDown className={`w-4 h-4 text-secondary-600 dark:text-secondary-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-secondary-800 rounded-xl shadow-xl border border-secondary-200 dark:border-secondary-700 py-2 z-20 backdrop-blur-lg">
                    <Link
                      to={`/profile/${user?.id}`}
                      className="flex items-center space-x-3 px-4 py-2.5 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors text-secondary-700 dark:text-secondary-200"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FiUser className="w-4 h-4" />
                      <span className="font-medium">My Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-3 px-4 py-2.5 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors text-secondary-700 dark:text-secondary-200"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FiSettings className="w-4 h-4" />
                      <span className="font-medium">Settings</span>
                    </Link>
                    <hr className="my-2 border-secondary-200 dark:border-secondary-700" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left text-red-600 dark:text-red-400 font-medium"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

