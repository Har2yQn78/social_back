import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { authService } from '../services/auth'
import { Card, CardContent, CardHeader, CardTitle, Spinner } from '../components/ui'
import { toast } from 'sonner'

export default function ActivatePage() {
  const { token = '' } = useParams()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    async function run() {
      if (!token) {
        setStatus('error')
        setMessage('Activation token is missing.')
        return
      }
      setStatus('loading')
      try {
        await authService.activate({ token })
        setStatus('success')
        setMessage('Your account has been activated. You can now log in.')
        toast.success('Account activated')
      } catch (e: any) {
        setStatus('error')
        setMessage(e?.message || 'Activation failed')
        toast.error(e?.message || 'Activation failed')
      }
    }
    run()
  }, [token])

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Activate account</CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="flex items-center gap-2">
              <Spinner /> <span>Activating…</span>
            </div>
          )}
          {status !== 'loading' && (
            <>
              <p className={status === 'error' ? 'text-red-600' : 'text-neutral-700'}>{message}</p>
              <div className="mt-4">
                <Link
                  to="/login"
                  className="rounded-2xl bg-primary px-4 py-2 text-white hover:bg-primary-dark"
                >
                  Go to login
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
