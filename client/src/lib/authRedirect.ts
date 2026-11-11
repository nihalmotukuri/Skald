const APP_HOME = '/app/today'
const LOCAL_ORIGIN = 'https://skald.local'

export const getSafeAuthDestination = (value: unknown): string => {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return APP_HOME
  }

  const destination = new URL(value, LOCAL_ORIGIN)
  if (destination.origin !== LOCAL_ORIGIN) return APP_HOME
  if (destination.pathname !== '/auth/update-password' && !destination.pathname.startsWith('/app/')) {
    return APP_HOME
  }

  return `${destination.pathname}${destination.search}${destination.hash}`
}

export const getAuthCallbackPath = (destination: string, flow: 'signin' | 'signup' = 'signin'): string => {
  const callback = new URL('/auth/callback', LOCAL_ORIGIN)
  callback.searchParams.set('next', getSafeAuthDestination(destination))
  callback.searchParams.set('flow', flow)
  return `${callback.pathname}${callback.search}`
}

export const getAuthCallbackUrl = (destination: string, flow: 'signin' | 'signup' = 'signin'): string => {
  const callback = new URL('/auth/callback', window.location.origin)
  callback.searchParams.set('next', getSafeAuthDestination(destination))
  callback.searchParams.set('flow', flow)
  return callback.toString()
}
