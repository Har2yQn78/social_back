import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

type ThemeState = {
  theme: Theme
  setTheme: (t: Theme) => void
  toggle: () => void
}

function applyTheme(t: Theme) {
  const root = document.documentElement
  if (t === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: t => {
        applyTheme(t)
        set({ theme: t })
      },
      toggle: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        applyTheme(next)
        set({ theme: next })
      }
    }),
    { name: 'gosocial_theme_v1' }
  )
)

applyTheme(useThemeStore.getState().theme)
