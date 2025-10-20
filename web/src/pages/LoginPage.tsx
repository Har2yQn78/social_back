import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.store'
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '../components/ui'
import { Form, Field, getError } from '../components/form/Form'
import { toast } from 'sonner'

const LoginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
type LoginForm = z.infer<typeof LoginSchema>

function useFromParam() {
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const from = params.get('from')
  return from && from.startsWith('/') ? from : '/feed'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const from = useFromParam()
  const loginWithCredentials = useAuthStore(s => s.loginWithCredentials)
  const token = useAuthStore(s => s.token)
  const [submitting, setSubmitting] = useState(false)

  // If already logged in, bounce to target
  useEffect(() => {
    if (token) navigate(from, { replace: true })
  }, [token, from, navigate])

  const form = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  })

  async function onSubmit(values: LoginForm) {
    setSubmitting(true)
    try {
      await loginWithCredentials(values)
      toast.success('Logged in')
      navigate(from, { replace: true })
    } catch (e: any) {
      toast.error(e?.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  const { register, handleSubmit, formState } = form

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Field label="Email" htmlFor="email" error={getError(formState.errors, 'email')}>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
            </Field>

            <Field
              label="Password"
              htmlFor="password"
              error={getError(formState.errors, 'password')}
            >
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
              />
            </Field>

            <Button type="submit" disabled={submitting} loading={submitting} className="w-full">
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>

            <p className="mt-3 text-center text-sm text-neutral-600">
              New here?{' '}
              <Link to="/register" className="font-medium text-neutral-900 underline">
                Create an account
              </Link>
            </p>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
