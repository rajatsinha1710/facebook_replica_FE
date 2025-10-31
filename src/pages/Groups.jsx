import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mockGroups, mockUsers } from '../api/mockData'
import { FiUsers, FiPlus, FiSearch } from 'react-icons/fi'
import { initializeData, updateData, getStoredData, STORAGE_KEYS } from '../utils/storage'

const Groups = () => {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all') // all, my-groups

  useEffect(() => {
    // Load groups from storage
    const storedGroups = initializeData(STORAGE_KEYS.GROUPS, mockGroups)
    setGroups(storedGroups)
  }, [])

  const myGroups = groups.filter(group => group.members.includes(user?.id))
  const otherGroups = groups.filter(group => !group.members.includes(user?.id))

  const filteredGroups = activeTab === 'my-groups' ? myGroups : groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleJoinGroup = (groupId) => {
    const group = groups.find(g => g.id === groupId)
    if (group && !group.members.includes(user.id)) {
      // Update in storage
      const updatedGroups = updateData(STORAGE_KEYS.GROUPS, groupId, {
        members: [...group.members, user.id]
      })
      setGroups(updatedGroups)
      alert('Joined group!')
    }
  }

  const getCreator = (groupId) => {
    const group = groups.find(g => g.id === groupId)
    const storedUsers = getStoredData(STORAGE_KEYS.USERS, mockUsers)
    return storedUsers.find(u => u.id === group?.createdBy)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 p-6 flex items-center justify-between backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">Groups</h1>
          <p className="text-secondary-600 dark:text-secondary-400">Discover and join groups</p>
        </div>
        <button className="flex items-center space-x-2 bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 dark:shadow-primary-500/10">
          <FiPlus className="w-5 h-5" />
          <span>Create Group</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 backdrop-blur-sm">
        <div className="flex border-b border-secondary-200 dark:border-secondary-800">
          <button
            onClick={() => setActiveTab('all')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'all'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100'
              }`}
          >
            All Groups ({groups.length})
          </button>
          <button
            onClick={() => setActiveTab('my-groups')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'my-groups'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100'
              }`}
          >
            My Groups ({myGroups.length})
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-secondary-200 dark:border-secondary-800">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-200 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 text-secondary-900 dark:text-secondary-100 placeholder:text-secondary-400 dark:placeholder:text-secondary-500 transition-all"
            />
          </div>
        </div>

        {/* Groups Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.length > 0 ? (
              filteredGroups.map(group => {
                const creator = getCreator(group.id)
                const isMember = group.members.includes(user?.id)
                return (
                  <div
                    key={group.id}
                    className="bg-secondary-50 dark:bg-secondary-800/50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow border border-secondary-200 dark:border-secondary-700"
                  >
                    <img
                      src={group.coverPhoto}
                      alt={group.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">{group.name}</h3>
                      <p className="text-secondary-600 dark:text-secondary-400 text-sm mb-4 line-clamp-2">{group.description}</p>
                      <div className="flex items-center justify-between text-sm text-secondary-600 dark:text-secondary-400 mb-4">
                        <div className="flex items-center space-x-1">
                          <FiUsers className="w-4 h-4" />
                          <span>{group.members.length} members</span>
                        </div>
                        {creator && (
                          <span className="text-xs">By {creator.name}</span>
                        )}
                      </div>
                      {isMember ? (
                        <button
                          disabled
                          className="w-full bg-secondary-200 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 px-4 py-2 rounded-xl font-semibold cursor-not-allowed"
                        >
                          Joined
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinGroup(group.id)}
                          className="w-full bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 dark:shadow-primary-500/10"
                        >
                          Join Group
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="col-span-full text-center py-12 text-secondary-500 dark:text-secondary-400">
                <p>No groups found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Groups

