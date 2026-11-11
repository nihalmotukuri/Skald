import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getSafeAuthDestination } from '@/lib/authRedirect'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/appStore'
import BrandMark from '@/components/BrandMark'

const finishingPageDuration = 3000

const preloadDestination = (destination: string): Promise<unknown> => {
  switch (destination.split(/[?#]/, 1)[0]) {
    case '/app/tasks':
      return import('./Tasks')
    case '/app/notes':
      return import('./Notes')
    case '/app/assistant':
      return import('./Assistant')
    case '/app/settings':
      return import('./Settings')
    case '/app/today':
    case '/app/dashboard':
    case '/app/':
      return import('./Dashboard')
    default:
      return import('./NotFound')
  }
}

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null)
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)
  const [finishingStartedAt, setFinishingStartedAt] = useState<number | null>(null)
  const [destinationReady, setDestinationReady] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const authLoading = useAppStore((state) => state.authLoading)
  const user = useAppStore((state) => state.user)
  const isDark = useAppStore((state) => state.isDark)
  const params = new URLSearchParams(location.search)
  const destination = getSafeAuthDestination(params.get('next'))
  const flow = params.get('flow') === 'signup' ? 'signup' : 'signin'

  useEffect(() => {
    let active = true
    const callbackParams = new URLSearchParams(location.search)
    const providerError = callbackParams.get('error_description') ?? callbackParams.get('error')

    if (providerError) {
      setError(providerError)
      return () => { active = false }
    }

    const finishAuthentication = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!data.session) throw new Error('This authentication link is invalid or has expired. Request a new link and try again.')
      if (!active) return

      const callbackDestination = getSafeAuthDestination(callbackParams.get('next'))
      if (callbackDestination === '/auth/update-password') {
        navigate(callbackDestination, { replace: true })
        return
      }

      setFinishingStartedAt(Date.now())
      setSessionUserId(data.session.user.id)
      await preloadDestination(callbackDestination)
      if (active) setDestinationReady(true)
    }

    void finishAuthentication().catch((reason: unknown) => {
      console.error('Unable to complete authentication callback:', reason)
      if (active) {
        setError(reason instanceof Error ? reason.message : 'Unable to complete sign-in. Please try again.')
      }
    })

    return () => { active = false }
  }, [location.search, navigate])

  useEffect(() => {
    if (sessionUserId === null || finishingStartedAt === null || !destinationReady || error || authLoading) return
    if (!user || user.id !== sessionUserId) {
      setError('Unable to load your workspace. Please sign in again.')
      return
    }

    const timeout = window.setTimeout(
      () => navigate(destination, { replace: true }),
      Math.max(0, finishingStartedAt + finishingPageDuration - Date.now()),
    )
    return () => window.clearTimeout(timeout)
  }, [authLoading, destination, destinationReady, error, finishingStartedAt, navigate, sessionUserId, user])

  return (
    <main className={`skald-auth-finish min-h-screen px-5 py-10 flex items-center justify-center ${
      isDark ? 'bg-[#0f111a] text-white' : 'bg-[#f5f3ee] text-slate-900'
    }`}>
      <section className="skald-auth-finish__content w-full text-center" aria-live="polite">
        <BrandMark className="skald-auth-finish__brand" />
        <h1 className="skald-auth-finish__title">
          {error
            ? `We couldn’t finish your ${flow === 'signup' ? 'sign-up' : 'sign-in'}`
            : `Finishing ${flow === 'signup' ? 'sign-up' : 'sign-in'}…`}
        </h1>
        {error && (
          <p role="alert" className={`skald-auth-finish__error ${isDark ? 'text-red-300' : 'text-red-700'}`}>
            {error}
          </p>
        )}
        {error && (
          <Link className="skald-auth-finish__link" to="/signin">Return to sign in</Link>
        )}
      </section>
    </main>
  )
}

export default AuthCallback
