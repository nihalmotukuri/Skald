import { NavLink, useLocation } from 'react-router-dom'
import { Bot, CalendarDays, ListTodo, NotebookPen, Settings as SettingsIcon } from 'lucide-react'
import BrandMark from './BrandMark'

const appNavigation = [
  { name: 'Today', icon: CalendarDays, path: '/app/today' },
  { name: 'Tasks', icon: ListTodo, path: '/app/tasks' },
  { name: 'Notes', icon: NotebookPen, path: '/app/notes' },
  { name: 'Mr Groff', icon: Bot, path: '/app/assistant' },
]

const Sidebar = ({ open }: { open: boolean }) => {
  const location = useLocation()

  const isNavigationActive = (path: string) => {
    const targetPath = path.split('?')[0]
    return location.pathname === targetPath
  }

  return (
    <>
      <aside className={`skald-sidebar ${open ? '' : 'skald-sidebar--collapsed'}`} aria-label="Workspace navigation">
        <div>
          <NavLink to="/app/today" className="skald-sidebar-brand" aria-label="Skald Today">
            {open ? <BrandMark /> : <span className="skald-sidebar-brand__initial">S</span>}
          </NavLink>

          <p className={`skald-sidebar-label ${open ? '' : 'sr-only'}`}>WORKSPACE</p>
          <nav className="skald-sidebar-nav" aria-label="Main navigation">
            {appNavigation.map(({ name, icon: Icon, path }) => {
              const active = isNavigationActive(path)
              return (
                <NavLink
                  key={path}
                  to={path}
                  title={open ? undefined : name}
                  aria-label={name}
                  aria-current={active ? 'page' : undefined}
                  className={`skald-sidebar-link ${active ? 'is-active' : ''}`}
                >
                  <Icon size={18} aria-hidden="true" />
                  {open && <span>{name}</span>}
                </NavLink>
              )
            })}
          </nav>
        </div>

        <footer className="skald-sidebar-footer">
          <NavLink
            to="/app/settings"
            title={open ? undefined : 'Settings'}
            aria-label="Settings"
            aria-current={location.pathname === '/app/settings' ? 'page' : undefined}
            className={`skald-sidebar-link skald-sidebar-settings ${location.pathname === '/app/settings' ? 'is-active' : ''}`}
          >
            <SettingsIcon size={18} aria-hidden="true" />
            {open && <span>Settings</span>}
          </NavLink>
        </footer>
      </aside>

      <nav className="skald-mobile-nav" aria-label="Main navigation">
        {[...appNavigation, { name: 'Settings', icon: SettingsIcon, path: '/app/settings' }].map(({ name, icon: Icon, path }) => {
          const active = isNavigationActive(path)
          return (
            <NavLink
              key={path}
              to={path}
              aria-label={name}
              aria-current={active ? 'page' : undefined}
              className={`skald-mobile-nav-link ${active ? 'is-active' : ''}`}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{name === 'Mr Groff' ? 'Groff' : name}</span>
            </NavLink>
          )
        })}
      </nav>
    </>
  )
}

export default Sidebar
