import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, LogOut, Moon, Sun } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getAuthCallbackUrl } from '@/lib/authRedirect'
import { getWorkspacePreferences, saveWorkspacePreferences, type TaskPriorityPreference, type TaskViewPreference } from '@/lib/workspacePreferences'
import { useAppStore } from '@/store/appStore'
import TaskDropdown from '@/components/TaskDropdown'

const taskViews: { value: TaskViewPreference; label: string }[] = [
  { value: 'all', label: 'All tasks' },
  { value: 'active', label: 'Active' },
  { value: 'today', label: 'Today' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'completed', label: 'Completed' },
]

const isTaskPriority = (value: string): value is TaskPriorityPreference =>
  value === 'Low' || value === 'Medium' || value === 'High'

const isTaskView = (value: string): value is TaskViewPreference =>
  taskViews.some((view) => view.value === value)

const Settings = () => {
  const navigate = useNavigate()
  const user = useAppStore((state) => state.user)
  const setUser = useAppStore((state) => state.setUser)
  const isDark = useAppStore((state) => state.isDark)
  const setTheme = useAppStore((state) => state.setTheme)
  const setBreadcrumb = useAppStore((state) => state.setBreadcrumb)
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [profileState, setProfileState] = useState<{ message: string; error: boolean }>({ message: '', error: false })
  const [emailState, setEmailState] = useState<{ message: string; error: boolean }>({ message: '', error: false })
  const [passwordState, setPasswordState] = useState<{ message: string; error: boolean }>({ message: '', error: false })
  const [pageError, setPageError] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [changingEmail, setChangingEmail] = useState(false)
  const [sendingReset, setSendingReset] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [preferences, setPreferences] = useState(getWorkspacePreferences)

  useEffect(() => {
    setBreadcrumb('Settings')
  }, [setBreadcrumb])

  useEffect(() => {
    setDisplayName(user?.displayName ?? '')
    setEmail(user?.email ?? '')
  }, [user?.displayName, user?.email])

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user?.id) return
    const name = displayName.trim()
    if (!name) {
      setProfileState({ message: 'Enter a name before saving.', error: true })
      return
    }

    setSavingProfile(true)
    setProfileState({ message: '', error: false })
    setPageError('')
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: name })
        .eq('id', user.id)
        .select('id')
        .single()
      if (error) throw error
      setUser({ ...user, displayName: name })
      setDisplayName(name)
      setProfileState({ message: 'Your name is saved.', error: false })
    } catch (error) {
      console.error('Unable to save profile:', error)
      setProfileState({ message: error instanceof Error ? error.message : 'Unable to save your profile.', error: true })
    } finally {
      setSavingProfile(false)
    }
  }

  const changeEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user?.email || email.trim().toLowerCase() === user.email.toLowerCase()) return

    setChangingEmail(true)
    setEmailState({ message: '', error: false })
    setPageError('')
    try {
      const { error } = await supabase.auth.updateUser(
        { email: email.trim() },
        { emailRedirectTo: getAuthCallbackUrl('/app/settings') }
      )
      if (error) throw error
      setEmailState({ message: 'Check your new email address to confirm the change.', error: false })
    } catch (error) {
      console.error('Unable to update email address:', error)
      setEmailState({ message: error instanceof Error ? error.message : 'Unable to start the email change.', error: true })
    } finally {
      setChangingEmail(false)
    }
  }

  const sendPasswordReset = async () => {
    if (!user?.email) return
    setSendingReset(true)
    setPageError('')
    setPasswordState({ message: '', error: false })
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: getAuthCallbackUrl('/auth/update-password'),
      })
      if (error) throw error
      setPasswordState({ message: 'Password reset instructions were sent to your email.', error: false })
    } catch (error) {
      console.error('Unable to send password reset email:', error)
      setPasswordState({ message: error instanceof Error ? error.message : 'Unable to send password reset instructions.', error: true })
    } finally {
      setSendingReset(false)
    }
  }

  const updatePreference = (patch: Partial<typeof preferences>) => {
    const next = { ...preferences, ...patch }
    try {
      saveWorkspacePreferences(next)
      setPreferences(next)
      setPageError('')
    } catch (error) {
      console.error('Unable to save workspace preference:', error)
      setPageError(error instanceof Error ? error.message : 'Unable to save workspace preferences.')
    }
  }

  const signOut = async () => {
    setSigningOut(true)
    setPageError('')
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      navigate('/signin', { replace: true })
    } catch (error) {
      console.error('Sign out failed:', error)
      setPageError(error instanceof Error ? error.message : 'Unable to sign out. Please try again.')
      setSigningOut(false)
    }
  }

  return (
    <div className={`skald-page skald-settings-page ${isDark ? 'text-white' : 'text-slate-900'}`}>
      <header className="skald-page-header skald-settings-header">
        <div>
          <p className="skald-workspace-kicker">Make this space yours</p>
          <h1 className="skald-page-title">Settings</h1>
          <p className="skald-page-description">Shape your workspace, account, and the way tasks begin.</p>
        </div>
      </header>

      {pageError && <p className="skald-settings-notice" role="alert">{pageError}</p>}

      <section className="skald-settings-section" aria-labelledby="skald-settings-appearance">
        <div className="skald-settings-section__heading">
          <div>
            <h2 id="skald-settings-appearance">Appearance</h2>
            <p>Choose the atmosphere that feels right.</p>
          </div>
        </div>
        <div className="skald-settings-theme-options" role="group" aria-label="Color theme">
          <button
            type="button"
            className={`skald-settings-theme-option${isDark ? ' is-selected' : ''}`}
            onClick={() => setTheme(true)}
            aria-pressed={isDark}
          >
            <Moon aria-hidden="true" size={18} />
            <span><strong>Dark</strong><small>Soft contrast for quieter evenings</small></span>
            {isDark && <Check aria-hidden="true" size={15} />}
          </button>
          <button
            type="button"
            className={`skald-settings-theme-option${!isDark ? ' is-selected' : ''}`}
            onClick={() => setTheme(false)}
            aria-pressed={!isDark}
          >
            <Sun aria-hidden="true" size={18} />
            <span><strong>Light</strong><small>A bright, focused canvas</small></span>
            {!isDark && <Check aria-hidden="true" size={15} />}
          </button>
        </div>
      </section>

      <section className="skald-settings-section" aria-labelledby="skald-settings-tasks">
        <div className="skald-settings-section__heading">
          <div>
            <h2 id="skald-settings-tasks">Task preferences</h2>
            <p>Set the defaults used when you open Tasks or create a task.</p>
          </div>
        </div>
        <div className="skald-settings-preferences">
          <div className="skald-settings-preference">
            <div>
              <strong>Default task priority</strong>
              <span>Preselected when creating a task.</span>
            </div>
            <TaskDropdown
              ariaLabel="Default task priority"
              className="skald-settings-dropdown"
              value={preferences.defaultTaskPriority}
              options={(['Low', 'Medium', 'High'] as TaskPriorityPreference[]).map((value) => ({ value, label: value }))}
              onChange={(value) => {
                if (isTaskPriority(value)) updatePreference({ defaultTaskPriority: value })
              }}
            />
          </div>
          <div className="skald-settings-preference">
            <div>
              <strong>Default task view</strong>
              <span>Shown when opening Tasks without a selected view.</span>
            </div>
            <TaskDropdown
              ariaLabel="Default task view"
              className="skald-settings-dropdown"
              value={preferences.defaultTaskView}
              options={taskViews}
              onChange={(value) => {
                if (isTaskView(value)) updatePreference({ defaultTaskView: value })
              }}
            />
          </div>
        </div>
      </section>

      <section className="skald-settings-section" aria-labelledby="skald-settings-profile">
        <div className="skald-settings-section__heading">
          <div>
            <h2 id="skald-settings-profile">Profile</h2>
            <p>Your name appears in your Skald workspace.</p>
          </div>
        </div>
        <form className="skald-settings-profile-form" onSubmit={saveProfile}>
          <label className="skald-settings-field">
            <span>Name</span>
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.currentTarget.value)}
              maxLength={255}
              autoComplete="name"
              required
            />
          </label>
          <div className="skald-settings-form-footer">
            <span className={profileState.error ? 'is-error' : ''} role={profileState.error ? 'alert' : 'status'}>{profileState.message}</span>
            <button type="submit" className="skald-settings-primary" disabled={savingProfile || !displayName.trim() || displayName.trim() === user?.displayName}>
              {savingProfile ? 'Saving…' : 'Save name'}
            </button>
          </div>
        </form>
      </section>

      <section className="skald-settings-section" aria-labelledby="skald-settings-security">
        <div className="skald-settings-section__heading">
          <div>
            <h2 id="skald-settings-security">Sign-in & security</h2>
            <p>Manage your email address and password.</p>
          </div>
        </div>
        <form className="skald-settings-email-form" onSubmit={changeEmail}>
          <label className="skald-settings-field">
            <span>Email address</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              autoComplete="email"
              required
            />
          </label>
          <div className="skald-settings-form-footer">
            <span className={emailState.error ? 'is-error' : ''} role={emailState.error ? 'alert' : 'status'}>{emailState.message}</span>
            <button type="submit" className="skald-settings-secondary" disabled={changingEmail || !email.trim() || email.trim().toLowerCase() === user?.email.toLowerCase()}>
              {changingEmail ? 'Sending…' : 'Change email'}
            </button>
          </div>
        </form>
        <div className="skald-settings-password">
          <div>
            <strong>Password</strong>
            <span>We’ll send a secure reset link to your current email.</span>
          </div>
          <button type="button" className="skald-settings-secondary" onClick={() => void sendPasswordReset()} disabled={sendingReset || !user?.email}>
            {sendingReset ? 'Sending…' : 'Send reset link'}
          </button>
        </div>
        {passwordState.message && (
          <p className={`skald-settings-inline-feedback${passwordState.error ? ' is-error' : ''}`} role={passwordState.error ? 'alert' : 'status'}>
            {passwordState.message}
          </p>
        )}
        <div className="skald-settings-password skald-settings-password--last">
          <div>
            <strong>Two-factor authentication</strong>
            <span>Multi-factor sign-in is not enabled for this workspace yet.</span>
          </div>
          <span className="skald-settings-status">Not available</span>
        </div>
      </section>

      <section className="skald-settings-section skald-settings-section--last" aria-labelledby="skald-settings-session">
        <div className="skald-settings-section__heading">
          <div>
            <h2 id="skald-settings-session">Session</h2>
            <p>Sign out of this device when you’re finished.</p>
          </div>
        </div>
        <button type="button" className="skald-settings-signout" onClick={() => void signOut()} disabled={signingOut}>
          <LogOut aria-hidden="true" size={15} />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </section>
    </div>
  )
}

export default Settings
