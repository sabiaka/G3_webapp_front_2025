'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

// Client-side guard that checks access_token in storage and redirects to /login if missing
export default function AuthGuard({ children }) {
    const router = useRouter()
    const pathname = usePathname()
    const [authorized, setAuthorized] = useState(false)

    useEffect(() => {
        try {
            const token =
                typeof window !== 'undefined' &&
                (window.localStorage.getItem('access_token') || window.sessionStorage.getItem('access_token'))

            if (!token) {
                const next = encodeURIComponent(pathname || '/')
                router.replace(`/login?next=${next}`)
                return
            }

            setAuthorized(true)
        } catch (e) {
            // On any error, be safe and send to login
            const next = encodeURIComponent(pathname || '/')
            router.replace(`/login?next=${next}`)
        }
    }, [router, pathname])

    if (!authorized) return null

    return children
}
