import { Link, NavLink } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useState } from 'react'

type Props = { children: React.ReactNode }

export default function AppLayout({ children }: Props) {
  const [open, setOpen] = useState(false)

  const navClasses =
    'text-sm font-medium text-neutral-700 hover:text-neutral-900 px-3 py-2 rounded-xl transition-colors'
  const active =
    'bg-neutral-200 text-neutral-900'

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
