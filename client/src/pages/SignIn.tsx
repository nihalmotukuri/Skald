import { useEffect, useState, type FormEvent } from 'react'
import { FcGoogle } from 'react-icons/fc'
import { Moon, Sparkles, Sun } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { getAuthCallbackUrl, getSafeAuthDestination } from '@/lib/authRedirect'
import { useAppStore } from '@/store/appStore'
import BrandMark from '@/components/BrandMark'

type AuthMode = 'signin' | 'signup' | 'recovery'
type AuthLocationState = {
  from?: {
    pathname?: string
    search?: string
    hash?: string
  }
}

const SignIn = () => {
  const [isRecovery, setIsRecovery] = useState(false)
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppStore((state) => state.user)
  const authLoading = useAppStore((state) => state.authLoading)
  const isDark = useAppStore((state) => state.isDark)
  const setTheme = useAppStore((state) => state.setTheme)
  const isSignup = location.pathname === '/signup'
  const mode: AuthMode = isSignup ? 'signup' : isRecovery ? 'recovery' : 'signin'

  const routeState = location.state as AuthLocationState | null
  const routeDestination = routeState?.from
    ? `${routeState.from.pathname ?? ''}${routeState.from.search ?? ''}${routeState.from.hash ?? ''}`
    : new URLSearchParams(location.search).get('next')
  const destination = getSafeAuthDestination(routeDestination)

  useEffect(() => {
    if (user && !authLoading) navigate(destination, { replace: true })
  }, [authLoading, destination, navigate, user])

  const changeMode = (nextMode: AuthMode) => {
    setError(null)
    setMessage(null)
    setPassword('')
    setConfirmPassword('')
    if (nextMode === 'signup' || nextMode === 'signin') {
      setIsRecovery(false)
      navigate(
        { pathname: nextMode === 'signup' ? '/signup' : '/signin', search: location.search },
        { state: location.state },
      )
    } else {
      setIsRecovery(true)
    }
  }

  const showError = (reason: unknown, fallback: string) => {
    console.error('Authentication request failed:', reason)
    setError(reason instanceof Error ? reason.message : fallback)
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: getAuthCallbackUrl(destination) },
      })
      if (signInError) throw signInError
    } catch (reason) {
      showError(reason, 'Unable to start Google sign-in. Please try again.')
      setLoading(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (mode === 'recovery') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: getAuthCallbackUrl('/auth/update-password'),
        })
        if (resetError) throw resetError
        setMessage('If an account exists for that email, a password reset link is on its way.')
        return
      }

      if (mode === 'signup') {
        if (password.length < 12) {
          setError('Use a password with at least 12 characters.')
          return
        }
        if (password !== confirmPassword) {
          setError('Your passwords do not match.')
          return
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: getAuthCallbackUrl(destination),
            data: { full_name: displayName.trim() },
          },
        })
        if (signUpError) throw signUpError
        if (data.session) {
          navigate(destination, { replace: true })
          return
        }
        setPassword('')
        setConfirmPassword('')
        setMessage('Check your email for a confirmation link to finish creating your account.')
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (signInError) throw signInError
      navigate(destination, { replace: true })
    } catch (reason) {
      showError(reason, 'Unable to complete that request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={`skald-auth relative flex min-h-screen items-center justify-center px-5 py-10 ${
      isDark ? 'skald-auth--dark bg-[#101017]' : 'skald-auth--light bg-[#f5f3ee]'
    }`}>
      <button
        type="button"
        className="skald-auth__theme-toggle fixed right-6 top-4 grid size-10 place-items-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        onClick={() => setTheme(!isDark)}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      >
        {isDark ? <Sun size={17} /> : <Moon size={17} />}
      </button>
      <div className="skald-auth__shell">
        <aside className="skald-auth__story">
          <Link to="/" className="skald-auth__brand" aria-label="Skald home">
            <BrandMark />
          </Link>
          <div className="skald-auth__story-copy">
            <span className="skald-auth__story-mark"><Sparkles size={18} aria-hidden="true" /></span>
            <p className="skald-auth__eyebrow">A quieter way to get things done</p>
            <h2>Make room for <em>what matters.</em></h2>
            <p className="skald-auth__story-description">
              Your tasks, notes, and next good idea—together in a space that helps you find your way back to focus.
            </p>
          </div>
          <p className="skald-auth__story-footer">Start where you are. The rest can wait.</p>
        </aside>

        <section className="skald-auth__card">
          <header className="skald-auth__header">
            <p className="skald-auth__kicker">{mode === 'signup' ? 'A fresh start' : 'Your space is here'}</p>
            <h1 className="skald-auth__title font-semibold">
              {mode === 'signup' ? 'Create your account' : mode === 'recovery' ? 'Reset your password' : 'Welcome back'}
            </h1>
            <p className={`mt-2 text-sm ${isDark ? 'text-white/65' : 'text-slate-600'}`}>
              {mode === 'signup'
                ? 'A clear space for your next chapter.'
                : mode === 'recovery'
                  ? 'We’ll email you a secure password reset link.'
                  : 'Sign in to pick up where you left off.'}
            </p>
          </header>

        {mode !== 'recovery' && (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={`skald-auth__google flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border px-4 font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300 disabled:cursor-wait disabled:opacity-60 ${
                isDark ? 'border-white/20 bg-white/5 hover:bg-white/10' : 'border-slate-300 bg-white/75 hover:bg-white'
              }`}
            >
              <FcGoogle aria-hidden="true" className="text-xl" />
              Continue with Google
            </button>
            <div className={`skald-auth__divider my-5 flex items-center gap-3 text-xs uppercase tracking-wider ${isDark ? 'text-white/45' : 'text-slate-400'}`}>
              <span className={`h-px flex-1 ${isDark ? 'bg-white/15' : 'bg-slate-200'}`} />
              or use email
              <span className={`h-px flex-1 ${isDark ? 'bg-white/15' : 'bg-slate-200'}`} />
            </div>
          </>
        )}

        <form className="skald-auth__form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label className={`skald-auth__field ${isDark ? 'text-white/75' : 'text-slate-700'}`}>
              Name
              <input
                autoComplete="name"
                className={`w-full border px-3 outline-none focus:border-indigo-400 ${
                  isDark ? 'border-white/15 bg-black/20 text-white' : 'border-slate-300 bg-white text-slate-900'
                }`}
                maxLength={100}
                onChange={(event) => setDisplayName(event.target.value)}
                required
                value={displayName}
              />
            </label>
          )}
          <label className={`skald-auth__field ${isDark ? 'text-white/75' : 'text-slate-700'}`}>
            Email
            <input
              autoComplete="email"
              className={`w-full border px-3 outline-none focus:border-indigo-400 ${
                isDark ? 'border-white/15 bg-black/20 text-white' : 'border-slate-300 bg-white text-slate-900'
              }`}
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          {mode !== 'recovery' && (
            <label className={`skald-auth__field ${isDark ? 'text-white/75' : 'text-slate-700'}`}>
              Password
              <input
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                className={`w-full border px-3 outline-none focus:border-indigo-400 ${
                  isDark ? 'border-white/15 bg-black/20 text-white' : 'border-slate-300 bg-white text-slate-900'
                }`}
                minLength={mode === 'signup' ? 12 : undefined}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
              {mode === 'signup' && <span className={`skald-auth__hint ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Use at least 12 characters.</span>}
            </label>
          )}

          {mode === 'signup' && (
            <label className={`skald-auth__field ${isDark ? 'text-white/75' : 'text-slate-700'}`}>
              Confirm password
              <input
                autoComplete="new-password"
                className={`w-full border px-3 outline-none focus:border-indigo-400 ${
                  isDark ? 'border-white/15 bg-black/20 text-white' : 'border-slate-300 bg-white text-slate-900'
                }`}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                type="password"
                value={confirmPassword}
              />
            </label>
          )}

          {error && <p role="alert" className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>{error}</p>}
          {message && <p role="status" aria-live="polite" className={`text-sm ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`}>{message}</p>}

          <button
            className="skald-auth__submit w-full bg-indigo-600 px-4 font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-wait disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading
              ? 'Please wait…'
              : mode === 'signup'
                ? 'Create account'
                : mode === 'recovery'
                  ? 'Send reset link'
                  : 'Sign in'}
          </button>
        </form>

        <div className="skald-auth__footer flex min-h-6 justify-between gap-4 text-indigo-500">
          {mode === 'signin' ? (
            <>
              <button type="button" className={`hover:underline disabled:opacity-50 ${isDark ? 'hover:text-white' : 'hover:text-indigo-700'}`} disabled={loading} onClick={() => changeMode('recovery')}>Forgot password?</button>
              <Link className={`hover:underline ${isDark ? 'hover:text-white' : 'hover:text-indigo-700'}`} to={{ pathname: '/signup', search: location.search }} state={location.state}>Create account</Link>
            </>
          ) : mode === 'signup' ? (
            <>
              <span>Already have an account?</span>
              <Link className={`hover:underline ${isDark ? 'hover:text-white' : 'hover:text-indigo-700'}`} to={{ pathname: '/signin', search: location.search }} state={location.state}>Sign in</Link>
            </>
          ) : (
            <>
              <span />
              <button type="button" className={`hover:underline disabled:opacity-50 ${isDark ? 'hover:text-white' : 'hover:text-indigo-700'}`} disabled={loading} onClick={() => changeMode('signin')}>Back to sign in</button>
            </>
          )}
        </div>
        </section>
      </div>
    </main>
  )
}

export default SignIn
