import { useEffect, useState, type FormEvent } from 'react'
import { FcGoogle } from 'react-icons/fc'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { getAuthCallbackUrl, getSafeAuthDestination } from '@/lib/authRedirect'
import { useAppStore } from '@/store/appStore'

type AuthMode = 'signin' | 'signup' | 'recovery'
type AuthLocationState = {
  from?: {
    pathname?: string
    search?: string
    hash?: string
  }
}

const SignIn = () => {
  const [mode, setMode] = useState<AuthMode>('signin')
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

  const routeState = location.state as AuthLocationState | null
  const routeDestination = routeState?.from
    ? `${routeState.from.pathname ?? ''}${routeState.from.search ?? ''}${routeState.from.hash ?? ''}`
    : new URLSearchParams(location.search).get('next')
  const destination = getSafeAuthDestination(routeDestination)

  useEffect(() => {
    if (user && !authLoading) navigate(destination, { replace: true })
  }, [authLoading, destination, navigate, user])

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setError(null)
    setMessage(null)
    setPassword('')
    setConfirmPassword('')
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
    <main className="min-h-screen bg-[#0f111a] px-5 py-10 text-white flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border border-white/15 bg-white/[0.04] p-7 shadow-2xl shadow-black/30 sm:p-9">
        <header className="mb-8 text-center">
          <img src="/images/logo.png" className="mx-auto mb-3 size-11" alt="" />
          <p className="text-sm tracking-[0.3em] text-indigo-200">SKALD</p>
          <h1 className="mt-5 text-2xl font-semibold">
            {mode === 'signup' ? 'Create your account' : mode === 'recovery' ? 'Reset your password' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm text-white/65">
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
              className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/5 px-4 font-medium transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300 disabled:cursor-wait disabled:opacity-60"
            >
              <FcGoogle aria-hidden="true" className="text-xl" />
              Continue with Google
            </button>
            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-white/45">
              <span className="h-px flex-1 bg-white/15" />
              or use email
              <span className="h-px flex-1 bg-white/15" />
            </div>
          </>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label className="block text-sm text-white/75">
              Name
              <input
                autoComplete="name"
                className="mt-1.5 min-h-11 w-full rounded-xl border border-white/15 bg-black/20 px-3 text-white outline-none focus:border-indigo-300"
                maxLength={100}
                onChange={(event) => setDisplayName(event.target.value)}
                required
                value={displayName}
              />
            </label>
          )}
          <label className="block text-sm text-white/75">
            Email
            <input
              autoComplete="email"
              className="mt-1.5 min-h-11 w-full rounded-xl border border-white/15 bg-black/20 px-3 text-white outline-none focus:border-indigo-300"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          {mode !== 'recovery' && (
            <label className="block text-sm text-white/75">
              Password
              <input
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                className="mt-1.5 min-h-11 w-full rounded-xl border border-white/15 bg-black/20 px-3 text-white outline-none focus:border-indigo-300"
                minLength={mode === 'signup' ? 12 : undefined}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
              {mode === 'signup' && <span className="mt-1 block text-xs text-white/50">Use at least 12 characters.</span>}
            </label>
          )}

          {mode === 'signup' && (
            <label className="block text-sm text-white/75">
              Confirm password
              <input
                autoComplete="new-password"
                className="mt-1.5 min-h-11 w-full rounded-xl border border-white/15 bg-black/20 px-3 text-white outline-none focus:border-indigo-300"
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                type="password"
                value={confirmPassword}
              />
            </label>
          )}

          {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
          {message && <p role="status" aria-live="polite" className="text-sm text-emerald-200">{message}</p>}

          <button
            className="min-h-12 w-full rounded-xl bg-indigo-500 px-4 font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-200 disabled:cursor-wait disabled:opacity-60"
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

        <div className="mt-5 flex min-h-6 justify-between gap-4 text-sm text-indigo-200">
          {mode === 'signin' ? (
            <>
              <button type="button" className="hover:text-white disabled:opacity-50" disabled={loading} onClick={() => changeMode('recovery')}>Forgot password?</button>
              <button type="button" className="hover:text-white disabled:opacity-50" disabled={loading} onClick={() => changeMode('signup')}>Create account</button>
            </>
          ) : (
            <>
              <span />
              <button type="button" className="hover:text-white disabled:opacity-50" disabled={loading} onClick={() => changeMode('signin')}>Back to sign in</button>
            </>
          )}
        </div>
      </section>
    </main>
  )
}

export default SignIn
