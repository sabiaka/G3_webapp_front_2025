'use client'

import { useEffect, useState } from 'react'

import { usePathname, useRouter } from 'next/navigation'

// Client-side guard that checks access_token in storage and redirects to /login if missing
export default function AuthGuard({ children }) {
    const router = useRouter()
    const pathname = usePathname()
    const [authorized, setAuthorized] = useState(false)

    useEffect(() => {
        let isMounted = true

        const redirectToLogin = () => {
            const next = encodeURIComponent(pathname || '/')

            router.replace(`/login?next=${next}`)
        }

        const clearAuth = () => {
            try {
                if (typeof window !== 'undefined') {
                    window.localStorage.removeItem('access_token')
                    window.localStorage.removeItem('user')
                    window.sessionStorage.removeItem('access_token')
                    window.sessionStorage.removeItem('user')
                }
            } catch {}
        }

        const redirectToError = (params = {}) => {
            const search = new URLSearchParams({
                from: pathname || '/',
                ...Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null))
            }).toString()

            router.replace(`/error?${search}`)
        }

        const checkAuth = async () => {
            try {
                const token =
                    typeof window !== 'undefined' &&
                    (window.localStorage.getItem('access_token') || window.sessionStorage.getItem('access_token'))

                if (!token) return redirectToLogin()

                // Validate token via /api/auth/me
                const apiBase = process.env.NEXT_PUBLIC_BASE_PATH || ''

                // Add a timeout so we don't hang forever if DB/back-end is unresponsive
                const controller = new AbortController()
                const timeoutMs = 5000
                const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

                let res
                try {
                    res = await fetch(`${apiBase}/api/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` },
                        credentials: 'include',
                        signal: controller.signal
                    })
                } finally {
                    clearTimeout(timeoutId)
                }

                if (res.ok) {
                    // Optionally refresh user info in storage for other consumers
                    try {
                        const data = await res.json()

                        if (typeof window !== 'undefined') {
                            const useLocal = !!window.localStorage.getItem('access_token')
                            const storage = useLocal ? window.localStorage : window.sessionStorage

                            storage.setItem('user', JSON.stringify(data))
                        }
                    } catch {}

                    if (isMounted) setAuthorized(true)
                } else if (res.status === 401) {
                    clearAuth()
                    redirectToLogin()
                } else {
                    // Other HTTP errors: redirect to error page with status info
                    redirectToError({ code: String(res.status) })
                }
            } catch (e) {
                // Network/timeout error: redirect to error page
                // Distinguish abort (timeout) if possible
                const isAbort = (e && typeof e === 'object' && 'name' in e && e.name === 'AbortError')
                redirectToError({ code: isAbort ? 'timeout' : 'network' })
            }
        }

        checkAuth()

        return () => {
            isMounted = false
        }
    }, [router, pathname])

    if (!authorized) return null

    return children
}
