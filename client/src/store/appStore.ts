import { create } from 'zustand'
import type { User } from '@/types/user'

interface AppState {
  user: User | null
  authLoading: boolean
  pathname: string | null
  isDark: boolean
  sidebarOpen: boolean
  breadcrumb: string
  activeNoteId: string | null
  setUser: (user: User | null) => void
  setAuthLoading: (loading: boolean) => void
  setPathname: (pathname: string | null) => void
  setTheme: (isDark: boolean) => void
  toggleSidebar: () => void
  setBreadcrumb: (breadcrumb: string) => void
  setActiveNoteId: (noteId: string | null) => void
}

const storedTheme = localStorage.getItem('is_dark')

export const useAppStore = create<AppState>((set) => ({
  user: null,
  authLoading: true,
  pathname: null,
  isDark: storedTheme !== 'false',
  sidebarOpen: true,
  breadcrumb: '',
  activeNoteId: null,
  setUser: (user) => set({ user }),
  setAuthLoading: (authLoading) => set({ authLoading }),
  setPathname: (pathname) => set({ pathname }),
  setTheme: (isDark) => {
    localStorage.setItem('is_dark', JSON.stringify(isDark))
    set({ isDark })
  },
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setBreadcrumb: (breadcrumb) => set({ breadcrumb }),
  setActiveNoteId: (activeNoteId) => set({ activeNoteId })
}))
