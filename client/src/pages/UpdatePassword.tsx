import { useEffect, useState, type FormEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import BrandMark from '@/components/BrandMark'

const UpdatePassword = () => {
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [complete, setComplete] = useState(false)
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    let active = true
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      if (sessionError) {
        setError(sessionError.message)
      } else {
        setHasSession(Boolean(data.session))
      }
      setCheckingSession(false)
    }).catch((reason: unknown) => {
      console.error('Unable to verify password recovery session:', reason)
      if (active) {
        setError(reason instanceof Error ? reason.message : 'Unable to verify your reset link.')
        setCheckingSession(false)
      }
    })
    return () => { active = false }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    if (password.length < 12) {
      setError('Use a password with at least 12 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Your passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setComplete(true)
      setPassword('')
      setConfirmPassword('')
      window.setTimeout(() => navigate('/app/today', { replace: true }), 1200)
    } catch (reason) {
      console.error('Unable to update password:', reason)
      setError(reason instanceof Error ? reason.message : 'Unable to update your password. Request a new reset link and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0f111a] px-5 py-10 text-white flex items-center justify-center">
      <motion.section
        className="w-full max-w-md rounded-3xl border border-white/15 bg-white/[0.04] p-7 shadow-2xl shadow-black/30 sm:p-9"
        initial={reducedMotion ? false : { opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.4, ease: 'easeOut' }}
      >
        <BrandMark className="mx-auto mb-4 size-11" />
        <h1 className="text-center text-2xl font-semibold">Choose a new password</h1>
        {checkingSession ? (
          <p className="mt-5 text-center text-sm text-white/65">Verifying your secure reset link…</p>
        ) : !hasSession ? (
          <div className="mt-5 text-center">
            <p role="alert" className="text-sm text-red-300">
              {error ?? 'This reset link is invalid or has expired. Request a new one to continue.'}
            </p>
            <Link className="mt-5 inline-block text-indigo-200 underline underline-offset-4" to="/signin">Request another link</Link>
          </div>
        ) : complete ? (
          <p role="status" aria-live="polite" className="mt-5 text-center text-sm text-emerald-200">
            Password updated. Taking you to your workspace…
          </p>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm text-white/75">
              New password
              <input
                autoComplete="new-password"
                className="mt-1.5 min-h-11 w-full rounded-xl border border-white/15 bg-black/20 px-3 text-white outline-none focus:border-indigo-300"
                minLength={12}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
              <span className="mt-1 block text-xs text-white/50">Use at least 12 characters.</span>
            </label>
            <label className="block text-sm text-white/75">
              Confirm new password
              <input
                autoComplete="new-password"
                className="mt-1.5 min-h-11 w-full rounded-xl border border-white/15 bg-black/20 px-3 text-white outline-none focus:border-indigo-300"
                minLength={12}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                type="password"
                value={confirmPassword}
              />
            </label>
            {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
            <button
              className="min-h-12 w-full rounded-xl bg-indigo-500 px-4 font-semibold transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-200 disabled:cursor-wait disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
      </motion.section>
    </main>
  )
}

export default UpdatePassword
