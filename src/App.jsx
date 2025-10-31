import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { ChatProvider } from './context/ChatContext'
import { ThemeProvider } from './context/ThemeContext'

import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Friends from './pages/Friends'
import Messages from './pages/Messages'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import Groups from './pages/Groups'
import Events from './pages/Events'
import Search from './pages/Search'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <ChatProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/profile/:userId" element={<Profile />} />
                        <Route path="/friends" element={<Friends />} />
                        <Route path="/messages" element={<Messages />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/groups" element={<Groups />} />
                        <Route path="/events" element={<Events />} />
                        <Route path="/search" element={<Search />} />
                      </Routes>
                    </Layout>
                  </PrivateRoute>
                }
              />
            </Routes>
            </ChatProvider>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App

