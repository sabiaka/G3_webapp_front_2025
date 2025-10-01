// Shared utilities for employee list feature

export const getToken = () =>
  (typeof window !== 'undefined' && (window.localStorage.getItem('access_token') || window.sessionStorage.getItem('access_token'))) || ''

export const getAuthHeaders = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const ensureHash = hex => {
  if (!hex) return '#999999'
  return String(hex).startsWith('#') ? String(hex) : `#${hex}`
}

export const stripHash = hex => (hex || '').replace(/^#/, '')
