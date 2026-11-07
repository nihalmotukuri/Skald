import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getSafeAuthDestination } from '@/lib/authRedirect'
import { supabase } from '@/lib/supabase'

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    const params = new URLSearchParams(location.search)
    const providerError = params.get('error_description') ?? params.get('error')

    if (providerError) {
      setError(providerError)
      return () => { active = false }
    }

    const finishAuthentication = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!data.session) throw new Error('This authentication link is invalid or has expired. Request a new link and try again.')
      if (active) navigate(getSafeAuthDestination(params.get('next')), { replace: true })
    }

    void finishAuthentication().catch((reason: unknown) => {
      console.error('Unable to complete authentication callback:', reason)
      if (active) {
        setError(reason instanceof Error ? reason.message : 'Unable to complete sign-in. Please try again.')
      }
    })

    return () => { active = false }
  }, [location.search, navigate])

  return (
    <main className="min-h-screen bg-[#0f111a] px-5 py-10 text-white flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border border-white/15 bg-white/[0.04] p-8 text-center">
        <img src="/images/logo.png" className="mx-auto mb-4 size-11" alt="" />
        <h1 className="text-xl font-semibold">{error ? 'Sign-in could not be completed' : 'Finishing sign-in…'}</h1>
        {error && (
          <>
            <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>
            <Link className="mt-6 inline-block text-indigo-200 underline underline-offset-4" to="/signin">Return to sign in</Link>
          </>
        )}
      </section>
    </main>
  )
}

export default AuthCallback
