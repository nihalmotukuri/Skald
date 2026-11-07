import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { LineWobble } from 'ldrs/react'
import 'ldrs/react/LineWobble.css'
import { Moon, PanelLeftClose, PanelLeftOpen, Plus, Sun } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import Sidebar from './Sidebar'
import NoteReminderWatcher from './NoteReminderWatcher'
import BrandMark from './BrandMark'

const routeTitles: Record<string, string> = {
  '/app/today': 'Today',
  '/app/tasks': 'Tasks',
  '/app/notes': 'Notes',
  '/app/assistant': 'Mr Groff',
  '/app/settings': 'Settings',
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
  const isTasksPage = location.pathname === '/app/tasks'
  const isTodayPage = location.pathname === '/app/today'
  const isNotesPage = location.pathname === '/app/notes'
  const isSettingsPage = location.pathname === '/app/settings'

  if (!user && !loading) {
    return <Navigate to="/signin" replace state={{ from: location }} />
  }

  return (
    <main className={`skald-app ${isDark ? 'skald-app--dark' : 'skald-app--light'}`}>
      {loading ? (
        <div className="skald-app-loading" role="status" aria-label="Loading your workspace">
          <BrandMark className="skald-app-loading__brand" />
          <LineWobble
            size="56"
            stroke="4"
            bgOpacity="0.1"
            speed="1.75"
            color={isDark ? '#a095ff' : '#6654e8'}
          />
        </div>
      ) : user ? (
        <>
          <NoteReminderWatcher />
          <Sidebar open={sidebarOpen} />

          <section className="skald-app-content" aria-label="Workspace">
            <header className={`skald-app-header${isTodayPage ? ' skald-app-header--dashboard' : ''}`}>
              {isTodayPage ? (
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
                </div>
              ) : (
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
                  <Link to="/app/today" className="skald-app-mobile-brand" aria-label="Skald workspace home">
                    <BrandMark />
                  </Link>
                  <div className="skald-app-heading">
                    <h1>{pageTitle}</h1>
                  </div>
                </div>
              )}

              <div className="skald-app-header__actions">
                {!isTodayPage && <span className="skald-app-header__date">
                  {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>}
                {!isTasksPage && !isTodayPage && !isNotesPage && !isSettingsPage && (
                  <Link
                    to="/app/tasks?create=1"
                    className="skald-app-add-task skald-add-action"
                    aria-label="Add task"
                    title="Add task"
                  >
                    <span className="skald-add-action__icon"><Plus size={16} aria-hidden="true" /></span>
                    <span>New task</span>
                  </Link>
                )}
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
