import axios from 'axios'
import { API_BASE_URL } from './env'

// Axios instance with sensible defaults
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  withCredentials: false
})

// ------- Auth token injection (wired in Step 5) -------
let tokenProvider: (() => string | null) | null = null

/**
 * Step 5 will call this with a function that returns the current JWT.
 * Example (later):
 *   setAuthTokenProvider(() => authStore.getState().token)
 */
export function setAuthTokenProvider(provider: () => string | null) {
  tokenProvider = provider
}

api.interceptors.request.use(config => {
  const token = tokenProvider?.()
  if (token) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`
    }
  }
  return config
})
// ------------------------------------------------------

// Optional: simple retry hint
export function isRetryableStatus(status?: number | null) {
  if (!status) return false
  return status === 429 || (status >= 500 && status < 600)
}
