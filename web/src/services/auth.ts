import { api } from '../lib/api'
import type { ActivateInput, LoginInput, RegisterInput } from '../types'
import { normalizeError } from '../lib/errors'

function extractToken(respData: unknown): string {
  if (!respData) throw new Error('Empty response from server')

  // Accept common shapes
  const asAny = respData as any
  if (typeof asAny === 'string') return asAny
  if (typeof asAny?.token === 'string') return asAny.token
  if (typeof asAny?.data === 'string') return asAny.data
  if (typeof asAny?.data?.token === 'string') return asAny.data.token

  throw new Error('Token not found in response')
}

export const authService = {
  async register(input: RegisterInput): Promise<void> {
    try {
      await api.post('/authentication/user', input)
    } catch (err) {
      const e = normalizeError(err)
      throw new Error(e.message)
    }
  },

  async activate({ token }: ActivateInput): Promise<void> {
    try {
      await api.put(`/users/activate/${encodeURIComponent(token)}`)
    } catch (err) {
      const e = normalizeError(err)
      throw new Error(e.message)
    }
  },

  async login(input: LoginInput): Promise<string> {
    try {
      const { data } = await api.post('/authentication/token', input)
      const token = extractToken(data)
      return token
    } catch (err) {
      const e = normalizeError(err)
      throw new Error(e.message)
    }
  }
}
