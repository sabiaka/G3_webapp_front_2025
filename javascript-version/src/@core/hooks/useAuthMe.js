import { useCallback, useEffect, useState } from 'react'

// 認証ユーザー情報を取得し、is_admin を返す共通フック
// 戻り値: { user, isAdmin, loading, error, refresh }
export default function useAuthMe() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [tick, setTick] = useState(0)

    const refresh = useCallback(() => setTick(t => t + 1), [])

    useEffect(() => {
        const ac = new AbortController()
        const run = async () => {
            setLoading(true)
            setError(null)
            try {
                const token = (typeof window !== 'undefined' && (window.localStorage.getItem('access_token') || window.sessionStorage.getItem('access_token'))) || ''
                if (!token) {
                    setUser(null)
                    return
                }
                const apiBase = process.env.NEXT_PUBLIC_BASE_PATH || ''
                const res = await fetch(`${apiBase}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` }, signal: ac.signal })
                if (res.ok) {
                    const data = await res.json()
                    setUser(data || null)
                } else if (res.status === 401) {
                    setUser(null)
                } else {
                    setError(new Error(`HTTP ${res.status}`))
                }
            } catch (e) {
                if (e?.name !== 'AbortError') setError(e)
            } finally {
                setLoading(false)
            }
        }
        run()
        return () => ac.abort()
    }, [tick])

    const isAdmin = !!user?.is_admin

    return { user, isAdmin, loading, error, refresh }
}
