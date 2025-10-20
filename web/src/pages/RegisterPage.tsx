import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../services/auth'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../components/ui'
import { Form, Field, getError } from '../components/form/Form'
import { toast } from 'sonner'

const RegisterSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(32, 'Username must be at most 32 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type RegisterForm = z.infer<typeof RegisterSchema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { username: '', email: '', password: '' },
    mode: 'onTouched',
  })

  async function onSubmit(values: RegisterForm) {
    setSubmitting(true)
    try {
      await authService.register(values)
      toast.success('Registration received. Check your email to activate your account.')
      navigate('/login')
    } catch (e: any) {
      toast.error(e?.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  const { register, handleSubmit, formState } = form

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Field
              label="Username"
              htmlFor="username"
              error={getError(formState.errors, 'username')}
            >
              <Input id="username" placeholder="yourname" {...register('username')} />
            </Field>

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
              {submitting ? 'Creating account…' : 'Create account'}
            </Button>

            <p className="mt-3 text-center text-sm text-neutral-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-neutral-900 underline">
                Log in
              </Link>
            </p>
          </Form>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-sm text-neutral-500">
        After registering, you’ll receive an activation email with a link.
      </p>
    </div>
  )
}
