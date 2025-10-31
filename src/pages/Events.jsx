import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mockEvents, mockUsers } from '../api/mockData'
import { FiCalendar, FiMapPin, FiClock, FiUsers, FiPlus, FiSearch } from 'react-icons/fi'
import { format } from 'date-fns'
import { initializeData, updateData, getStoredData, STORAGE_KEYS } from '../utils/storage'

const Events = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('upcoming') // upcoming, past, my-events

  useEffect(() => {
    // Load events from storage
    const storedEvents = initializeData(STORAGE_KEYS.EVENTS, mockEvents)
    setEvents(storedEvents)
  }, [])

  const now = new Date()
  const upcomingEvents = events.filter(event => new Date(event.date) > now)
  const pastEvents = events.filter(event => new Date(event.date) <= now)
  const myEvents = events.filter(event => event.attendees.includes(user?.id))

  const filteredEvents = events.filter(event => {
    const matchesTab =
      activeTab === 'upcoming' ? new Date(event.date) > now :
      activeTab === 'past' ? new Date(event.date) <= now :
      activeTab === 'my-events' ? event.attendees.includes(user?.id) : true

    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesTab && matchesSearch
  })

  const handleAttendEvent = (eventId) => {
    const event = events.find(e => e.id === eventId)
    if (event && !event.attendees.includes(user.id)) {
      // Update in storage
      const updatedEvents = updateData(STORAGE_KEYS.EVENTS, eventId, {
        attendees: [...event.attendees, user.id]
      })
      setEvents(updatedEvents)
      alert('You are now attending this event!')
    }
  }

  const getCreator = (eventId) => {
    const event = events.find(e => e.id === eventId)
    const storedUsers = getStoredData(STORAGE_KEYS.USERS, mockUsers)
    return storedUsers.find(u => u.id === event?.createdBy)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 p-6 flex items-center justify-between backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">Events</h1>
          <p className="text-secondary-600 dark:text-secondary-400">Discover and attend events</p>
        </div>
        <button className="flex items-center space-x-2 bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 dark:shadow-primary-500/10">
          <FiPlus className="w-5 h-5" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 backdrop-blur-sm">
        <div className="flex border-b border-secondary-200 dark:border-secondary-800">
          <button
            onClick={() => setActiveTab('upcoming')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'upcoming'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100'
              }`}
          >
            Upcoming ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'past'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100'
              }`}
          >
            Past ({pastEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('my-events')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'my-events'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100'
              }`}
          >
            My Events ({myEvents.length})
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-secondary-200 dark:border-secondary-800">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-200 dark:border-secondary-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 text-secondary-900 dark:text-secondary-100 placeholder:text-secondary-400 dark:placeholder:text-secondary-500 transition-all"
            />
          </div>
        </div>

        {/* Events Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => {
                const creator = getCreator(event.id)
                const isAttending = event.attendees.includes(user?.id)
                const eventDate = new Date(event.date)
                return (
                  <div
                    key={event.id}
                    className="bg-secondary-50 dark:bg-secondary-800/50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow border border-secondary-200 dark:border-secondary-700"
                  >
                    <img
                      src={event.coverPhoto}
                      alt={event.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex items-center space-x-2 text-sm text-primary-600 dark:text-primary-400 mb-2">
                        <FiCalendar className="w-4 h-4" />
                        <span>{format(eventDate, 'MMM dd, yyyy')}</span>
                        <FiClock className="w-4 h-4 ml-2" />
                        <span>{format(eventDate, 'h:mm a')}</span>
                      </div>
                      <h3 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">{event.name}</h3>
                      <p className="text-secondary-600 dark:text-secondary-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                      <div className="flex items-center space-x-2 text-sm text-secondary-600 dark:text-secondary-400 mb-4">
                        <FiMapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-secondary-600 dark:text-secondary-400 mb-4">
                        <div className="flex items-center space-x-1">
                          <FiUsers className="w-4 h-4" />
                          <span>{event.attendees.length} attending</span>
                        </div>
                        {creator && (
                          <span className="text-xs">By {creator.name}</span>
                        )}
                      </div>
                      {isAttending ? (
                        <button
                          disabled
                          className="w-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl font-semibold cursor-not-allowed"
                        >
                          Attending
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAttendEvent(event.id)}
                          className="w-full bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 dark:shadow-primary-500/10"
                        >
                          Attend Event
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="col-span-full text-center py-12 text-secondary-500 dark:text-secondary-400">
                <p>No events found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Events

