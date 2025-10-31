import Header from './Header'
import Sidebar from './Sidebar'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 transition-colors duration-200">
      <Header />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 ml-64 lg:ml-72 xl:ml-80 px-4 py-6 max-w-6xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout

