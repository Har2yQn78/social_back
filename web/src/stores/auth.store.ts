import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setAuthTokenProvider } from '../lib/api'
import type { LoginInput } from '../types'
import { authService } from '../services/auth'

type UserMinimal = {
  id?: string | number
  email?: string
  username?: string
  isActive?: boolean
} | null

type AuthState = {
  token: string | null
  user: UserMinimal
  initialized: boolean

  // actions
  initialize: () => void
  setToken: (token: string | null) => void
  setUser: (user: UserMinimal) => void
  loginWithCredentials: (input: LoginInput) => Promise<string>
  logout: () => void
}

const STORAGE_KEY = 'gosocial_auth_v1'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      initialized: false,

      initialize: () => {
        // Hook axios to always read the latest token from the store
        setAuthTokenProvider(() => get().token)
        set({ initialized: true })
      },

      setToken: (token: string | null) => {
        set({ token })
      },

      setUser: (user: UserMinimal) => {
        set({ user })
      },

      loginWithCredentials: async (input: LoginInput) => {
        const token = await authService.login(input)
        set({ token })
        return token
      },

      logout: () => {
        set({ token: null, user: null })
      }
    }),
    {
      name: STORAGE_KEY,
      partialize: state => ({ token: state.token, user: state.user }) // persist only what we need
    }
  )
)

// Initialize token provider once, at module import time
useAuthStore.getState().initialize()
