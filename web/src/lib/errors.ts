import axios from 'axios'

export type NormalizedError = {
  message: string
  status?: number
  details?: unknown
}

export function normalizeError(err: unknown): NormalizedError {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status
    const data = err.response?.data
    const msgFromServer =
      (typeof data === 'string' && data) ||
      (typeof (data as any)?.error === 'string' && (data as any).error) ||
      (typeof (data as any)?.message === 'string' && (data as any).message) ||
      undefined

    return {
      message: msgFromServer || err.message || 'Request failed',
      status,
      details: data ?? err.toJSON?.()
    }
  }

  if (err instanceof Error) {
    return { message: err.message }
  }

  return { message: 'Unknown error' }
}
