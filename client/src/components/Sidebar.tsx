import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { House, ListTodo, LogOut, NotebookPen, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/appStore'
import type { User } from '@/types/user'

const appNavigation = [
  { name: 'Dashboard', icon: House, path: '/app/dashboard' },
  { name: 'Tasks', icon: ListTodo, path: '/app/tasks' },
  { name: 'Notes', icon: NotebookPen, path: '/app/notes' },
  { name: 'Mr Groff', icon: Sparkles, path: '/app/assistant' },
]

const Sidebar = ({ user, open }: { user: User; open: boolean }) => {
  const navigate = useNavigate()
  const isDark = useAppStore((state) => state.isDark)
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const initial = user.displayName.trim().charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase() || '?'

  const userLogout = async () => {
    setLogoutError(null)
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign out failed:', error)
      setLogoutError('Unable to sign out. Please try again.')
      return
    }
    useAppStore.getState().setUser(null)
    navigate('/signin', { replace: true })
  }

  return (
    <>
      <aside className={`skald-sidebar ${open ? '' : 'skald-sidebar--collapsed'}`} aria-label="Workspace navigation">
        <div>
          <NavLink to="/app/dashboard" className="skald-sidebar-brand" aria-label="Skald dashboard">
            <img src={isDark ? '/images/logo.png' : '/images/logo-dark.png'} alt="" />
            {open && <span>SKALD</span>}
          </NavLink>

          <p className={`skald-sidebar-label ${open ? '' : 'sr-only'}`}>WORKSPACE</p>
          <nav className="skald-sidebar-nav" aria-label="Main navigation">
            {appNavigation.map(({ name, icon: Icon, path }) => (
              <NavLink
                key={path}
                to={path}
                title={open ? undefined : name}
                aria-label={name}
                className={({ isActive }) => `skald-sidebar-link ${isActive ? 'is-active' : ''}`}
              >
                <Icon size={19} aria-hidden="true" />
                {open && <span>{name}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="skald-sidebar-account">
          {user.photoURL ? (
            <img
              className="skald-sidebar-avatar"
              src={user.photoURL}
              onError={(event) => {
                event.currentTarget.hidden = true
              }}
              alt=""
            />
          ) : (
            <span className="skald-sidebar-avatar skald-sidebar-avatar--initial" aria-hidden="true">{initial}</span>
          )}
          {open && (
            <div className="skald-sidebar-identity">
              <span>{user.displayName || 'Your account'}</span>
              <span>{user.email}</span>
            </div>
          )}
          <button
            type="button"
            className="skald-sidebar-signout"
            onClick={userLogout}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={17} aria-hidden="true" />
          </button>
          {logoutError && <p className="skald-sidebar-error" role="alert">{logoutError}</p>}
        </div>
      </aside>

      <nav className="skald-mobile-nav" aria-label="Main navigation">
        {appNavigation.map(({ name, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            aria-label={name}
            className={({ isActive }) => `skald-mobile-nav-link ${isActive ? 'is-active' : ''}`}
          >
            <Icon size={19} aria-hidden="true" />
            <span>{name === 'Mr Groff' ? 'Groff' : name}</span>
          </NavLink>
        ))}
        <button type="button" className="skald-mobile-nav-link" onClick={userLogout} aria-label="Sign out">
          <LogOut size={19} aria-hidden="true" />
          <span>Sign out</span>
        </button>
        {logoutError && <span className="skald-mobile-nav-error" role="alert">{logoutError}</span>}
      </nav>
    </>
  )
}

export default Sidebar
