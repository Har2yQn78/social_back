// Centralized env access. No direct process.env in the browser.
const RAW_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined

// Default to relative '/v1' so dev proxy works without extra config.
export const API_BASE_URL = (RAW_BASE && RAW_BASE.trim()) || '/v1'
