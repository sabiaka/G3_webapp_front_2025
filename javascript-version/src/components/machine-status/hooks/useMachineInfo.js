'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { addDays, daysDiff, parseYmd, parseYmdSlash } from '../utils/date'

const defaultInfo = {
    name: '機械名をここに表示',
    todayWorkTime: 'HH-MM-SS',
    todayProduction: '不明',
    lastInspection: 'YY-MM-DD',
    nextInspection: 'YY-MM-DD',
}

export function useMachineInfo(machineId) {
    const [machineName, setMachineName] = useState(defaultInfo.name)
    const [todayUptimeHms, setTodayUptimeHms] = useState(null)
    const [todayProductionCount, setTodayProductionCount] = useState(null)
    const [machineDataLoading, setMachineDataLoading] = useState(false)
    const [machineDataError, setMachineDataError] = useState('')

    const [uptimeSeconds, setUptimeSeconds] = useState(null)
    const uptimeAnchorRef = useRef({ mode: 'base', startedAt: null, baseSeconds: 0, baseTs: 0 })

    const initialLastInspection = useMemo(() => parseYmdSlash(defaultInfo.lastInspection) || new Date(), [])
    const initialIntervalDays = useMemo(() => {
        const last = parseYmdSlash(defaultInfo.lastInspection)
        const next = parseYmdSlash(defaultInfo.nextInspection)
        if (last && next) {
            const diff = daysDiff(new Date(last), new Date(next))
            if (Number.isFinite(diff) && diff > 0) return diff
        }
        return 90
    }, [])

    const [lastInspectionDate, setLastInspectionDate] = useState(initialLastInspection)
    const [inspectionIntervalDays, setInspectionIntervalDays] = useState(initialIntervalDays)
    const nextInspectionDate = useMemo(() => addDays(lastInspectionDate, inspectionIntervalDays), [lastInspectionDate, inspectionIntervalDays])

    useEffect(() => {
        const controller = new AbortController()
        const tryParseStartedAt = (s) => {
            if (!s || typeof s !== 'string') return null
            let d = new Date(s)
            if (!isNaN(d.getTime())) return d
            let fixed = s.replace(/([A-Za-z]{3})T([A-Za-z]{3})/, '$1 $2')
            fixed = fixed.replace(/\+\d{2}:\d{2}$/, '')
            d = new Date(fixed)
            if (!isNaN(d.getTime())) return d
            return null
        }
        const fetchMachine = async () => {
            try {
                setMachineDataLoading(true)
                setMachineDataError('')
                const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
                const token =
                    (typeof window !== 'undefined' && (localStorage.getItem('access_token') || sessionStorage.getItem('access_token'))) || ''
                const url = `${base}/api/machines/${encodeURIComponent(machineId)}`
                const res = await fetch(url, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                    signal: controller.signal,
                })
                if (!res.ok) throw new Error(`Failed to fetch machine: ${res.status}`)
                const data = await res.json()
                if (data?.machine_name) setMachineName(data.machine_name)
                if (data?.today_uptime_hms) setTodayUptimeHms(data.today_uptime_hms)
                if (typeof data?.today_production_count === 'number') setTodayProductionCount(data.today_production_count)

                if (data?.last_inspection_date) {
                    const d = parseYmd(data.last_inspection_date)
                    if (d) setLastInspectionDate(d)
                }
                if (Number.isFinite(Number(data?.inspection_interval_days))) {
                    setInspectionIntervalDays(Number(data.inspection_interval_days))
                }

                const parsedStart = tryParseStartedAt(data?.started_at)
                const apiSec = Number.isFinite(Number(data?.today_uptime_seconds)) ? Number(data.today_uptime_seconds) : null
                const now = Date.now()
                const startMs = parsedStart?.getTime?.()
                // Use 'start' mode only when started_at is not in the future (allow tiny skew up to 5s)
                if (parsedStart && startMs <= now + 5000) {
                    const secFromStart = Math.max(0, Math.floor((now - startMs) / 1000))
                    const initial = apiSec != null ? Math.max(secFromStart, apiSec) : secFromStart
                    setUptimeSeconds(initial)
                    uptimeAnchorRef.current = { mode: 'start', startedAt: parsedStart, baseSeconds: initial, baseTs: now }
                } else if (apiSec != null) {
                    setUptimeSeconds(apiSec)
                    uptimeAnchorRef.current = { mode: 'base', startedAt: null, baseSeconds: apiSec, baseTs: now }
                } else if (data?.today_uptime_hms) {
                    const m = String(data.today_uptime_hms).match(/^(\d{1,2}):(\d{2}):(\d{2})$/)
                    if (m) {
                        const hh = Number(m[1]), mm = Number(m[2]), ss = Number(m[3])
                        const sec = hh * 3600 + mm * 60 + ss
                        setUptimeSeconds(sec)
                        uptimeAnchorRef.current = { mode: 'base', startedAt: null, baseSeconds: sec, baseTs: now }
                    }
                }
            } catch (e) {
                const msg = String(e?.message || '')
                if (e?.name === 'AbortError' || msg.toLowerCase().includes('abort')) {
                    // ignore abort in dev/strict mode
                } else {
                    setMachineDataError('機械情報の取得に失敗しました。ダミー情報を表示しています。')
                }
            } finally {
                setMachineDataLoading(false)
            }
        }
        fetchMachine()
        return () => {
            controller.abort()
        }
    }, [machineId])

    useEffect(() => {
        // API 応答前でも見た目が止まらないよう、最低限のブートストラップ
        // baseTs が未設定なら「今」を基準に 0 秒からスタート
        if (uptimeAnchorRef.current.mode === 'base' && uptimeAnchorRef.current.baseTs === 0) {
            uptimeAnchorRef.current = { ...uptimeAnchorRef.current, baseTs: Date.now() }
            if (uptimeSeconds == null) setUptimeSeconds(0)
        }

        const tick = () => {
            const now = Date.now()
            const anchor = uptimeAnchorRef.current
            if (anchor.mode === 'start' && anchor.startedAt instanceof Date) {
                const sec = Math.max(0, Math.floor((now - anchor.startedAt.getTime()) / 1000))
                setUptimeSeconds((prev) => (prev != null ? Math.max(sec, prev) : sec))
            } else if (anchor.mode === 'base' && anchor.baseTs > 0) {
                const elapsed = Math.floor((now - anchor.baseTs) / 1000)
                setUptimeSeconds(anchor.baseSeconds + Math.max(0, elapsed))
            }
        }
        const id = setInterval(tick, 1000)
        return () => {
            clearInterval(id)
        }
    }, [])

    return {
        machineName,
        todayUptimeHms,
        todayProductionCount,
        machineDataLoading,
        machineDataError,
        uptimeSeconds,
        setLastInspectionDate,
        lastInspectionDate,
        inspectionIntervalDays,
        setInspectionIntervalDays,
        nextInspectionDate,
        defaultInfo,
    }
}
