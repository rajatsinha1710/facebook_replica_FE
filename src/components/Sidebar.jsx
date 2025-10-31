import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  FiHome,
  FiUser,
  FiUsers,
  FiMessageCircle,
  FiBell,
  FiSettings,
  FiGrid,
  FiCalendar,
} from 'react-icons/fi'

const Sidebar = () => {
  const location = useLocation()
  const { user } = useAuth()

  const navItems = [
    { icon: FiHome, label: 'Home', path: '/home' },
    { icon: FiUser, label: 'Profile', path: `/profile/${user?.id}` },
    { icon: FiUsers, label: 'Friends', path: '/friends' },
    { icon: FiMessageCircle, label: 'Messages', path: '/messages' },
    { icon: FiBell, label: 'Notifications', path: '/notifications' },
    { icon: FiGrid, label: 'Groups', path: '/groups' },
    { icon: FiCalendar, label: 'Events', path: '/events' },
    { icon: FiSettings, label: 'Settings', path: '/settings' },
  ]

  const isActive = (path) => {
    if (path === '/home') {
      return location.pathname === '/home'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 lg:w-72 xl:w-80 bg-white/80 dark:bg-secondary-900/80 backdrop-blur-lg border-r border-secondary-200 dark:border-secondary-800 overflow-y-auto scrollbar-hide transition-colors duration-200">
      <div className="p-4 space-y-2">
        {/* User Profile Card */}
        <Link
          to={`/profile/${user?.id}`}
          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all duration-200 mb-4 group"
        >
          <img
            src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
            alt={user?.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-secondary-200 dark:ring-secondary-700 group-hover:ring-primary-500 dark:group-hover:ring-primary-400 transition-all"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-secondary-900 dark:text-secondary-100 truncate">{user?.name}</p>
            <p className="text-sm text-secondary-500 dark:text-secondary-400 truncate">View your profile</p>
          </div>
        </Link>

        {/* Navigation Items */}
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-semibold shadow-sm dark:shadow-primary-900/10'
                  : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-primary-600 dark:text-primary-400' : ''}`} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </aside>
  )
}

export default Sidebar

