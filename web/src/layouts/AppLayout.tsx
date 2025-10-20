import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../stores/auth.store'
import { useThemeStore } from '../stores/theme.store'
import { Button } from '../components/ui'

type Props = { children: React.ReactNode }

export default function AppLayout({ children }: Props) {
  const [open, setOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const auth = useAuthStore()
  const theme = useThemeStore()
  const navigate = useNavigate()

  const navClasses =
    'text-sm font-medium text-neutral-700 hover:text-neutral-900 px-3 py-2 rounded-xl transition-colors'
  const active = 'bg-neutral-200 text-neutral-900'

  function logout() {
    auth.logout()
    setUserMenu(false)
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden rounded-xl p-2 hover:bg-neutral-100"
                onClick={() => setOpen(v => !v)}
                aria-label="Toggle Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link to="/" className="font-semibold tracking-tight text-neutral-900">
                GoSocial
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/feed" className={({ isActive }) => `${navClasses} ${isActive ? active : ''}`}>
                Feed
              </NavLink>
              <NavLink to="/post/create" className={({ isActive }) => `${navClasses} ${isActive ? active : ''}`}>
                Create
              </NavLink>
              <NavLink to="/settings" className={({ isActive }) => `${navClasses} ${isActive ? active : ''}`}>
                Settings
              </NavLink>
            </nav>

            <div className="relative">
              {auth.token ? (
                <button
                  onClick={() => setUserMenu(v => !v)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
                >
                  <span>@{auth.user?.username ?? 'user'}</span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                        isActive ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-700 hover:text-neutral-900'
                      }`
                    }
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
                  >
                    Sign up
                  </NavLink>
                </div>
              )}

              {/* user dropdown */}
              {auth.token && userMenu && (
                <div
                  className="absolute right-0 mt-2 w-44 rounded-2xl border border-neutral-200 bg-white p-1 shadow-soft"
                  onMouseLeave={() => setUserMenu(false)}
                >
                  <Link
                    to="/settings"
                    className="block rounded-xl px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-100"
                    onClick={() => setUserMenu(false)}
                  >
                    Settings
                  </Link>
                  <button
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-100"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                  <div className="mt-1 border-t border-neutral-200 pt-1">
                    <Button
                      variant={theme.theme === 'dark' ? 'secondary' : 'secondary'}
                      size="sm"
                      className="w-full"
                      onClick={theme.toggle}
                    >
                      Toggle theme
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* mobile drawer */}
          {open && (
            <div className="md:hidden pb-3">
              <div className="flex flex-col gap-1">
                <NavLink to="/feed" onClick={() => setOpen(false)} className={({ isActive }) => `${navClasses} ${isActive ? active : ''}`}>
                  Feed
                </NavLink>
                <NavLink to="/post/create" onClick={() => setOpen(false)} className={({ isActive }) => `${navClasses} ${isActive ? active : ''}`}>
                  Create
                </NavLink>
                <NavLink to="/settings" onClick={() => setOpen(false)} className={({ isActive }) => `${navClasses} ${isActive ? active : ''}`}>
                  Settings
                </NavLink>
                {!auth.token ? (
                  <>
                    <NavLink to="/login" onClick={() => setOpen(false)} className={({ isActive }) => `${navClasses} ${isActive ? active : ''}`}>
                      Login
                    </NavLink>
                    <NavLink to="/register" onClick={() => setOpen(false)} className={({ isActive }) => `${navClasses} ${isActive ? active : ''}`}>
                      Sign up
                    </NavLink>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setOpen(false)
                      logout()
                    }}
                    className={`${navClasses} text-left`}
                  >
                    Log out
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

      <footer className="border-t border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-neutral-500">
          © {new Date().getFullYear()} GoSocial
        </div>
      </footer>
    </div>
  )
}
