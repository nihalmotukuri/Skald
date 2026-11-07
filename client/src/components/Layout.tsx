import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { Moon, PanelLeftClose, PanelLeftOpen, Sun } from 'lucide-react'
import { LineWobble } from 'ldrs/react'
import 'ldrs/react/LineWobble.css'
import { useAppStore } from '@/store/appStore'
import Sidebar from './Sidebar'

const routeTitles: Record<string, string> = {
  '/app/dashboard': 'Dashboard',
  '/app/tasks': 'Tasks',
  '/app/notes': 'Notes',
  '/app/assistant': 'Mr Groff',
}

const DashboardGrid = () => {
  const user = useAppStore((state) => state.user)
  const loading = useAppStore((state) => state.authLoading)
  const isDark = useAppStore((state) => state.isDark)
  const setTheme = useAppStore((state) => state.setTheme)
  const sidebarOpen = useAppStore((state) => state.sidebarOpen)
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)
  const location = useLocation()
  const pageTitle = routeTitles[location.pathname.replace(/\/+$/, '')] ?? 'Workspace'
  const firstName = user?.displayName.trim().split(/\s+/)[0] || 'there'

  if (!user && !loading) {
    return <Navigate to="/signin" replace state={{ from: location }} />
  }

  return (
    <main className={`skald-app ${isDark ? 'skald-app--dark' : 'skald-app--light'}`}>
      {loading ? (
        <div className="skald-app-loading" role="status" aria-label="Loading your workspace">
          <LineWobble
            size="80"
            stroke="5"
            bgOpacity="0.1"
            speed="1.75"
            color={isDark ? '#a095ff' : '#6654e8'}
          />
        </div>
      ) : user ? (
        <>
          <Sidebar user={user} open={sidebarOpen} />

          <section className="skald-app-content" aria-label="Workspace">
            <header className="skald-app-header">
              <div className="skald-app-header__leading">
                <button
                  type="button"
                  className="skald-app-icon-button skald-app-sidebar-toggle"
                  onClick={toggleSidebar}
                  aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                  title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                  {sidebarOpen ? <PanelLeftClose size={19} /> : <PanelLeftOpen size={19} />}
                </button>
                <Link to="/app/dashboard" className="skald-app-mobile-brand" aria-label="Skald workspace home">
                  <img src={isDark ? '/images/logo.png' : '/images/logo-dark.png'} alt="" />
                  <span>SKALD</span>
                </Link>
                <div className="skald-app-heading">
                  <span className="skald-app-heading__greeting">Your space, {firstName}</span>
                  <h1>{pageTitle}</h1>
                </div>
              </div>

              <div className="skald-app-header__actions">
                <span className="skald-app-header__date">
                  {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <button
                  type="button"
                  className="skald-app-icon-button"
                  onClick={() => setTheme(!isDark)}
                  aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
                  title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
            </header>

            <div className="skald-app-view">
              <Outlet />
            </div>
          </section>
        </>
      ) : null}
    </main>
  )
}

export default DashboardGrid
