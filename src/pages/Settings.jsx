import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FiUser, FiLock, FiBell, FiEye, FiTrash2 } from 'react-icons/fi'

const Settings = () => {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    workplace: user?.workplace || '',
    education: user?.education || '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateUser(formData)
    alert('Profile updated successfully!')
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'privacy', label: 'Privacy', icon: FiLock },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'account', label: 'Account', icon: FiEye },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 p-6 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Settings</h1>
        <p className="text-secondary-600 dark:text-secondary-400 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 p-4 backdrop-blur-sm">
            <nav className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-semibold shadow-sm dark:shadow-primary-900/10'
                        : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 p-6 backdrop-blur-sm">
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">Edit Profile</h2>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-secondary-200 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 bg-secondary-50 dark:bg-secondary-800/50 text-secondary-900 dark:text-secondary-100 transition-all"
                  />
                </div>

                <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-secondary-200 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 bg-secondary-50 dark:bg-secondary-800/50 text-secondary-900 dark:text-secondary-100 transition-all"
                  />
                </div>

                <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-secondary-200 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 bg-secondary-50 dark:bg-secondary-800/50 text-secondary-900 dark:text-secondary-100 transition-all"
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
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-secondary-200 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 bg-secondary-50 dark:bg-secondary-800/50 text-secondary-900 dark:text-secondary-100 transition-all"
                    placeholder="City, Country"
                  />
                </div>

                <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Workplace
                  </label>
                  <input
                    type="text"
                    name="workplace"
                    value={formData.workplace}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-secondary-200 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 bg-secondary-50 dark:bg-secondary-800/50 text-secondary-900 dark:text-secondary-100 transition-all"
                  />
                </div>

                <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Education
                  </label>
                  <input
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-secondary-200 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 bg-secondary-50 dark:bg-secondary-800/50 text-secondary-900 dark:text-secondary-100 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-primary-600 dark:bg-primary-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 dark:shadow-primary-500/10"
                >
                  Save Changes
                </button>
              </form>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">Privacy Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-secondary-200 dark:border-secondary-700 rounded-xl bg-secondary-50/50 dark:bg-secondary-800/30">
                    <div>
                      <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Profile Visibility</h3>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">Who can see your profile</p>
                    </div>
                    <select className="px-4 py-2 border border-secondary-200 dark:border-secondary-700 rounded-xl bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50">
                      <option>Everyone</option>
                      <option>Friends</option>
                      <option>Friends of Friends</option>
                      <option>Only Me</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-secondary-200 dark:border-secondary-700 rounded-xl bg-secondary-50/50 dark:bg-secondary-800/30">
                    <div>
                      <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Post Visibility</h3>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">Who can see your posts</p>
                    </div>
                    <select className="px-4 py-2 border border-secondary-200 dark:border-secondary-700 rounded-xl bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50">
                      <option>Everyone</option>
                      <option>Friends</option>
                      <option>Only Me</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">Notification Settings</h2>
                
                <div className="space-y-4">
                  {[
                    { label: 'Email Notifications', desc: 'Receive email notifications' },
                    { label: 'Push Notifications', desc: 'Receive push notifications' },
                    { label: 'Friend Requests', desc: 'Get notified about friend requests' },
                    { label: 'Comments', desc: 'Get notified when someone comments' },
                    { label: 'Likes', desc: 'Get notified when someone likes your post' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-secondary-200 dark:border-secondary-700 rounded-xl bg-secondary-50/50 dark:bg-secondary-800/30">
                      <div>
                        <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">{item.label}</h3>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-secondary-200 dark:bg-secondary-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-600/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 dark:after:border-secondary-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 dark:peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">Account Settings</h2>
                
                <div className="space-y-4">
                  <div className="p-4 border border-secondary-200 dark:border-secondary-700 rounded-xl bg-secondary-50/50 dark:bg-secondary-800/30">
                    <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">Change Password</h3>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">Update your password to keep your account secure</p>
                    <button className="bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 px-4 py-2 rounded-xl font-semibold hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors">
                      Change Password
                    </button>
                  </div>

                  <div className="p-4 border border-red-200 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-start space-x-3">
                      <FiTrash2 className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">Delete Account</h3>
                        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <button className="bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-700 dark:hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 dark:shadow-red-500/10">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

