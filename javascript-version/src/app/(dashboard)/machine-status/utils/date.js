'use client'

// 日付/時間ユーティリティ
export const parseYmdSlash = (s) => {
    const m = (s || '').match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/)

    if (!m) return null
    const y = Number(m[1])
    const mo = Number(m[2]) - 1
    const d = Number(m[3])
    const dt = new Date(y, mo, d)

    
return isNaN(dt.getTime()) ? null : dt
}

export const parseYmd = (s) => {
    if (!s) return null

    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) {
        const [y, m, d] = s.split('-').map(Number)
        const dt = new Date(y, m - 1, d)

        
return isNaN(dt.getTime()) ? null : dt
    }

    const bySlash = parseYmdSlash(s)

    if (bySlash) return bySlash
    const dt = new Date(s)

    
return isNaN(dt.getTime()) ? null : dt
}

export const formatYmdSlash = (d) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const da = String(d.getDate()).padStart(2, '0')

    
return `${y}/${m}/${da}`
}

export const secondsToHMS = (sec) => {
    if (sec == null || !Number.isFinite(sec)) return ''
    const s = Math.max(0, Math.floor(sec))
    const hh = String(Math.floor(s / 3600)).padStart(2, '0')
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')

    
return `${hh}:${mm}:${ss}`
}

export const daysDiff = (a, b) => {
    const MS = 24 * 60 * 60 * 1000

    
return Math.round((b.setHours(0, 0, 0, 0) - a.setHours(0, 0, 0, 0)) / MS)
}

export const addDays = (d, days) => {
    const nd = new Date(d)

    nd.setDate(nd.getDate() + days)
    
return nd
}
