import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { mockUsers, mockPosts, mockGroups, mockEvents } from '../api/mockData'
import { FiSearch, FiUser, FiFileText, FiUsers, FiCalendar } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { getStoredData, initializeData, STORAGE_KEYS } from '../utils/storage'

const Search = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(query)
  const [activeTab, setActiveTab] = useState('all') // all, people, posts, groups, events
  const [results, setResults] = useState({
    people: [],
    posts: [],
    groups: [],
    events: [],
  })

  useEffect(() => {
    setSearchQuery(query)
    performSearch(query)
  }, [query])

  const performSearch = (q) => {
    if (!q.trim()) {
      setResults({ people: [], posts: [], groups: [], events: [] })
      return
    }

    const lowerQuery = q.toLowerCase()

    // Load from storage
    const storedUsers = getStoredData(STORAGE_KEYS.USERS, mockUsers)
    const storedPosts = getStoredData(STORAGE_KEYS.POSTS, mockPosts)
    const storedGroups = initializeData(STORAGE_KEYS.GROUPS, mockGroups)
    const storedEvents = initializeData(STORAGE_KEYS.EVENTS, mockEvents)

    const people = storedUsers.filter(user =>
      user.name.toLowerCase().includes(lowerQuery) ||
      user.bio?.toLowerCase().includes(lowerQuery) ||
      user.location?.toLowerCase().includes(lowerQuery)
    )

    const posts = storedPosts.filter(post =>
      post.content?.toLowerCase().includes(lowerQuery)
    )

    const groups = storedGroups.filter(group =>
      group.name.toLowerCase().includes(lowerQuery) ||
      group.description?.toLowerCase().includes(lowerQuery)
    )

    const events = storedEvents.filter(event =>
      event.name.toLowerCase().includes(lowerQuery) ||
      event.description?.toLowerCase().includes(lowerQuery) ||
      event.location?.toLowerCase().includes(lowerQuery)
    )

    setResults({ people, posts, groups, events })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    performSearch(searchQuery)
    // Update URL without reload
    window.history.pushState({}, '', `/search?q=${encodeURIComponent(searchQuery)}`)
  }

  const getFilteredResults = () => {
    switch (activeTab) {
      case 'people':
        return results.people
      case 'posts':
        return results.posts
      case 'groups':
        return results.groups
      case 'events':
        return results.events
      default:
        return {
          people: results.people.slice(0, 3),
          posts: results.posts.slice(0, 3),
          groups: results.groups.slice(0, 3),
          events: results.events.slice(0, 3),
        }
    }
  }

  const totalResults = results.people.length + results.posts.length + results.groups.length + results.events.length

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 p-6 backdrop-blur-sm">
        <form onSubmit={handleSearch} className="relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500 w-6 h-6" />
          <input
            type="text"
            placeholder="Search ConnectHub..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-200 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 text-lg text-secondary-900 dark:text-secondary-100 placeholder:text-secondary-400 dark:placeholder:text-secondary-500 transition-all"
          />
        </form>
        {searchQuery && (
          <p className="mt-4 text-secondary-600 dark:text-secondary-400">
            {totalResults} {totalResults === 1 ? 'result' : 'results'} for "{searchQuery}"
          </p>
        )}
      </div>

      {/* Tabs */}
      {searchQuery && (
        <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 backdrop-blur-sm">
          <div className="flex border-b border-secondary-200 dark:border-secondary-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'all'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100'
              }`}
            >
              All ({totalResults})
            </button>
            <button
              onClick={() => setActiveTab('people')}
              className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'people'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100'
              }`}
            >
              People ({results.people.length})
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'posts'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100'
              }`}
            >
              Posts ({results.posts.length})
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'groups'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100'
              }`}
            >
              Groups ({results.groups.length})
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'events'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100'
              }`}
            >
              Events ({results.events.length})
            </button>
          </div>

          {/* Results */}
          <div className="p-6">
            {activeTab === 'all' ? (
              <div className="space-y-8">
                {results.people.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center space-x-2">
                      <FiUser className="w-5 h-5" />
                      <span>People</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.people.slice(0, 6).map(user => (
                        <Link
                          key={user.id}
                          to={`/profile/${user.id}`}
                          className="flex items-center space-x-3 p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors border border-secondary-200 dark:border-secondary-700"
                        >
                          <img
                            src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-secondary-200 dark:ring-secondary-700"
                          />
                          <div>
                            <p className="font-semibold text-secondary-900 dark:text-secondary-100">{user.name}</p>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400">{user.bio || user.location}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {results.posts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center space-x-2">
                      <FiFileText className="w-5 h-5" />
                      <span>Posts</span>
                    </h3>
                    <div className="space-y-4">
                      {results.posts.slice(0, 5).map(post => {
                        const storedUsers = getStoredData(STORAGE_KEYS.USERS, mockUsers)
                        const author = storedUsers.find(u => u.id === post.userId)
                        return (
                          <Link
                            key={post.id}
                            to={`/profile/${author?.id}`}
                            className="block p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors border border-secondary-200 dark:border-secondary-700"
                          >
                            <div className="flex items-center space-x-3 mb-2">
                              <img
                                src={author?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                alt={author?.name}
                                className="w-8 h-8 rounded-full object-cover ring-2 ring-secondary-200 dark:ring-secondary-700"
                              />
                              <div>
                                <p className="font-semibold text-secondary-900 dark:text-secondary-100">{author?.name}</p>
                                <p className="text-xs text-secondary-600 dark:text-secondary-400">
                                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                            <p className="text-secondary-700 dark:text-secondary-300 line-clamp-2">{post.content}</p>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}

                {results.groups.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center space-x-2">
                      <FiUsers className="w-5 h-5" />
                      <span>Groups</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.groups.slice(0, 6).map(group => (
                        <div
                          key={group.id}
                          className="bg-secondary-50 dark:bg-secondary-800/50 rounded-xl overflow-hidden hover:shadow-md transition-shadow border border-secondary-200 dark:border-secondary-700"
                        >
                          <img
                            src={group.coverPhoto}
                            alt={group.name}
                            className="w-full h-24 object-cover"
                          />
                          <div className="p-4">
                            <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-1">{group.name}</h4>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2">{group.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.events.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center space-x-2">
                      <FiCalendar className="w-5 h-5" />
                      <span>Events</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.events.slice(0, 6).map(event => (
                        <div
                          key={event.id}
                          className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <img
                            src={event.coverPhoto}
                            alt={event.name}
                            className="w-full h-24 object-cover"
                          />
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-1">{event.name}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-secondary-500 dark:text-secondary-400">
                <p>No {activeTab} found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!searchQuery && (
        <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 p-12 text-center backdrop-blur-sm">
          <FiSearch className="w-16 h-16 text-secondary-400 dark:text-secondary-500 mx-auto mb-4" />
          <p className="text-secondary-600 dark:text-secondary-400 text-lg">Search for people, posts, groups, and events</p>
        </div>
      )}
    </div>
  )
}

export default Search

