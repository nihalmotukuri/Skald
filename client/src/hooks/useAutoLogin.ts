import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/appStore'

const initialLoaderDuration = 1300

export const useAutoLogin = () => {
  const queryClient = useQueryClient()

  useEffect(() => {
    let requestId = 0
    let currentUserId: string | null = null
    let hasHandledInitialSession = false
    const initialAuthStartedAt = Date.now()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const authUser = session?.user ?? null
      if (hasHandledInitialSession && authUser?.id === currentUserId && event !== 'USER_UPDATED') return
      const currentRequestId = ++requestId
      const isInitialSession = !hasHandledInitialSession
      hasHandledInitialSession = true
      currentUserId = authUser?.id ?? null
      queryClient.clear()
      useAppStore.getState().setActiveNoteId(null)

      if (!authUser) {
        useAppStore.getState().setUser(null)
        if (isInitialSession) {
          window.setTimeout(() => {
            if (currentRequestId === requestId) useAppStore.getState().setAuthLoading(false)
          }, Math.max(0, initialLoaderDuration - (Date.now() - initialAuthStartedAt)))
        } else {
          useAppStore.getState().setAuthLoading(false)
        }
        return
      }

      useAppStore.getState().setUser(null)
      useAppStore.getState().setAuthLoading(true)
      queueMicrotask(() => {
        void loadProfile(authUser.id, authUser.email ?? '', authUser.user_metadata, currentRequestId, isInitialSession)
      })
    })

    async function loadProfile(
      userId: string,
      email: string,
      metadata: Record<string, unknown>,
      currentRequestId: number,
      isInitialSession: boolean
    ) {
      try {
        const profileResult = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .eq('id', userId)
          .single()

        if (profileResult.error) throw profileResult.error
        if (currentRequestId !== requestId) return

        useAppStore.getState().setUser({
          id: profileResult.data.id,
          displayName: profileResult.data.display_name
            ?? String(metadata.full_name ?? metadata.name ?? ''),
          email,
          photoURL: profileResult.data.avatar_url
            ?? String(metadata.avatar_url ?? metadata.picture ?? ''),
        })
      } catch (error) {
        if (currentRequestId === requestId) {
          console.error('Unable to load the signed-in Supabase profile:', error)
          useAppStore.getState().setUser(null)
        }
      } finally {
        if (isInitialSession) {
          await new Promise((resolve) => window.setTimeout(
            resolve,
            Math.max(0, initialLoaderDuration - (Date.now() - initialAuthStartedAt))
          ))
        }
        if (currentRequestId === requestId) useAppStore.getState().setAuthLoading(false)
      }
    }

    return () => {
      requestId += 1
      subscription.unsubscribe()
    }
  }, [queryClient])
}
