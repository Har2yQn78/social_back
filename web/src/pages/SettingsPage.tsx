import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.store'
import { useThemeStore } from '../stores/theme.store'
import { Button, Card, CardContent, CardHeader, CardTitle } from '../components/ui'
import { toast } from 'sonner'

export default function SettingsPage() {
  const navigate = useNavigate()
  const auth = useAuthStore()
  const theme = useThemeStore()

  useEffect(() => {
    if (!auth.token) {
      navigate('/login?from=/settings', { replace: true })
    }
  }, [auth.token, navigate])

  function handleLogout() {
    auth.logout()
    toast.success('Signed out')
    navigate('/login', { replace: true })
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-neutral-700">
            <div><span className="text-neutral-500">User ID:</span> {String(auth.user?.id ?? '—')}</div>
            <div><span className="text-neutral-500">Username:</span> {auth.user?.username ?? '—'}</div>
            <div><span className="text-neutral-500">Email:</span> {auth.user?.email ?? '—'}</div>
          </div>

          <div className="flex items-center justify-end">
            <Button variant="danger" onClick={handleLogout}>Log out</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <div className="font-medium">Theme</div>
            <div className="text-sm text-neutral-600">Current: {theme.theme}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={theme.theme === 'light' ? 'primary' : 'secondary'}
              onClick={() => theme.setTheme('light')}
            >
              Light
            </Button>
            <Button
              variant={theme.theme === 'dark' ? 'primary' : 'secondary'}
              onClick={() => theme.setTheme('dark')}
            >
              Dark
            </Button>
            <Button variant="secondary" onClick={theme.toggle}>
              Toggle
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
