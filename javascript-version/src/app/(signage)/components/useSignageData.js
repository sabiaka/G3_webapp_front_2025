"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const pad2 = n => String(Math.max(0, Number(n) || 0)).padStart(2, '0')
const formatDateYMD = iso => (iso ? String(iso).replace(/-/g, '/') : '--/--/--')
const formatNumber = n => {
  const num = Number(n) || 0
  try { return num.toLocaleString('ja-JP') } catch { return String(num) }
}

const CAMERA_IDS = ['B-spring01', 'B-spring02', 'B-spring03', 'B-spring04']

const useAuthHeader = () => {
  return useMemo(() => {
    if (typeof window === 'undefined') return {}
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      return token ? { Authorization: `Bearer ${token}` } : {}
    } catch {
      return {}
    }
  }, [])
}

export default function useSignageData() {
  const authHeader = useAuthHeader()

  // clock
  const [clock, setClock] = useState({ time: '--:--', date: '----/--/-- (--)' })

  // machine
  const [machineName, setMachineName] = useState('自動表層バネどめ機')
  const [todayProdCount, setTodayProdCount] = useState(0)
  const [lastInspectionDate, setLastInspectionDate] = useState('')
  const [nextInspectionDate, setNextInspectionDate] = useState('')
  const [startedAt, setStartedAt] = useState(null) // ISO
  const [todayUptimeSec, setTodayUptimeSec] = useState(0)
  const [machineBadge, setMachineBadge] = useState('info') // info|warning|error

  // logs
  const [logs, setLogs] = useState([])

  // inspection
  const [overallStatus, setOverallStatus] = useState('PASS')
  const [rotId, setRotId] = useState('')
  const [inspectionTime, setInspectionTime] = useState('--:--:--')
  const [tiles, setTiles] = useState(() => (
    [1, 2, 3, 4].map(i => ({ index: i, cameraId: CAMERA_IDS[i - 1], status: 'PASS', imageUrl: '', failReason: '' }))
  ))

  // alert
  const [alert, setAlert] = useState({ open: false, title: '', message: '' })
  const alertTimerRef = useRef(null)

  const fetchJson = useCallback((url, timeoutMs = 5000) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    return fetch(url, { signal: controller.signal, headers: { Accept: 'application/json', ...authHeader } })
      .then(res => {
        clearTimeout(timer)
        if (!res.ok) {
          const err = new Error(`API error: ${res.status} ${res.statusText}`)
          err.status = res.status
          throw err
        }
        return res.json()
      })
      .catch(err => {
        if (err && (err.name === 'AbortError' || err.code === 'ABORT_ERR')) {
          const e = new Error(`API timeout after ${timeoutMs}ms`)
          e.code = 'TIMEOUT'
          throw e
        }
        throw err
      })
  }, [authHeader])

  const getMachine = useCallback((id = 1, opts = {}) => fetchJson(`/api/machines/${id}`, opts.timeoutMs ?? 5000), [fetchJson])
  const getMachineLogs = useCallback((id = 1, opts = {}) => {
    const page = opts.page ?? 1
    const limit = opts.limit ?? 10
    return fetchJson(`/api/machines/${id}/logs?page=${encodeURIComponent(String(page))}&limit=${encodeURIComponent(String(limit))}`, opts.timeoutMs ?? 5000)
  }, [fetchJson])
  const getCurrentLot = useCallback((opts = {}) => fetchJson(`/api/ingress/inspection/current-lot`, opts.timeoutMs ?? 5000), [fetchJson])
  const getLotShots = useCallback((lotId, opts = {}) => fetchJson(`/api/inspections/lots/${encodeURIComponent(String(lotId))}/shots`, opts.timeoutMs ?? 5000), [fetchJson])
  const buildInspectionImageUrl = useCallback(imagePath => (imagePath ? `/api/inspections/images/${encodeURIComponent(String(imagePath))}` : ''), [])

  // clock tick + uptime tick
  useEffect(() => {
    const tick = () => {
      const n = new Date()
      const hh = pad2(n.getHours()); const mm = pad2(n.getMinutes()); const y = n.getFullYear(); const mo = pad2(n.getMonth() + 1); const d = pad2(n.getDate())
      const wk = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][n.getDay()]
      setClock({ time: `${hh}:${mm}`, date: `${y}/${mo}/${d} (${wk})` })
      if (startedAt) {
        const diffSec = Math.max(0, Math.floor((Date.now() - Date.parse(startedAt)) / 1000))
        setTodayUptimeSec(diffSec)
      }
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [startedAt])

  const addWarnLog = useCallback((title, message) => {
    const now = new Date(); const ts = now.toISOString()
    setLogs(prev => [{ log_type: 'warning', title, message, timestamp: ts }, ...prev])
  }, [])

  const resetToNormalFromStandby = useCallback(() => {
    setMachineBadge('info')
    setOverallStatus('PASS')
    setTiles(prev => prev.map(t => ({ ...t, status: 'PASS', failReason: '' })))
  }, [])

  // data loaders
  const loadMachine = useCallback(async () => {
    try {
      const data = await getMachine(1, { timeoutMs: 5000 })
      if (data?.machine_name) setMachineName(data.machine_name)
      if (data?.today_production_count != null) setTodayProdCount(data.today_production_count)
      if (data?.last_inspection_date) setLastInspectionDate(formatDateYMD(data.last_inspection_date))
      if (data?.next_inspection_date) setNextInspectionDate(formatDateYMD(data.next_inspection_date))
      if (data?.started_at) setStartedAt(data.started_at)
    } catch (err) {
      addWarnLog('W-API: 機械情報の取得に失敗', err?.code === 'TIMEOUT' ? 'タイムアウトしました。' : 'ネットワーク/サーバーエラー。')
    }
  }, [getMachine, addWarnLog])

  const loadLogs = useCallback(async () => {
    try {
      const resp = await getMachineLogs(1, { page: 1, limit: 10, timeoutMs: 5000 })
      const list = Array.isArray(resp?.logs) ? resp.logs : []
      setLogs(list)
      const top = list[0]
      if (top) {
        const t = String(top.log_type || 'info').toLowerCase()
        if (t === 'info' && typeof top.title === 'string' && top.title.trim().startsWith('I-002')) {
          resetToNormalFromStandby()
        } else {
          setMachineBadge(t)
        }
      }
    } catch (err) {
      addWarnLog('W-API: ログの取得に失敗', err?.code === 'TIMEOUT' ? 'タイムアウトしました。' : 'ネットワーク/サーバーエラー。')
    }
  }, [getMachineLogs, addWarnLog, resetToNormalFromStandby])

  const applyShots = useCallback((lotId, shots, capturedAtIso) => {
    const latestByCam = {}
    for (const s of shots || []) {
      if (!s?.camera_id) continue
      latestByCam[s.camera_id] = s
    }
    let allPass = true
    setTiles(prev => prev.map(t => {
      const entry = latestByCam[t.cameraId]
      if (!entry) return t
      const status = String(entry.status || 'PASS').toUpperCase()
      const imageUrl = buildInspectionImageUrl(entry.image_path)
      const details = entry.details || ''
      if (status === 'FAIL') allPass = false
      return { ...t, status, imageUrl, failReason: status === 'FAIL' ? details : '' }
    }))
    setOverallStatus(allPass ? 'PASS' : 'FAIL')
    const d = capturedAtIso ? new Date(capturedAtIso) : new Date()
    setRotId(lotId || '')
    setInspectionTime(`${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`)
  }, [buildInspectionImageUrl])

  const loadInspection = useCallback(async () => {
    try {
      const cur = await getCurrentLot({ timeoutMs: 5000 })
      if (!cur?.lot_id) throw new Error('No lot_id')
      const detail = await getLotShots(cur.lot_id, { timeoutMs: 5000 })
      const shots = Array.isArray(detail?.shots) ? detail.shots : []
      applyShots(cur.lot_id, shots, detail?.captured_at)
    } catch (err) {
      addWarnLog('W-API: 検査情報の取得に失敗', err?.code === 'TIMEOUT' ? 'タイムアウトしました。' : 'ネットワーク/サーバーエラー。')
    }
  }, [getCurrentLot, getLotShots, applyShots, addWarnLog])

  // initial/defaults
  useEffect(() => {
    // 初期は全て PASS に
    setOverallStatus('PASS')
    setTiles(prev => prev.map(t => ({ ...t, status: 'PASS', failReason: '' })))
    const now = new Date()
    setInspectionTime(`${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`)
  }, [])

  // load & poll
  useEffect(() => {
    loadMachine(); loadLogs(); loadInspection()
    const t = setInterval(() => { loadMachine(); loadLogs(); loadInspection() }, 60000)
    return () => clearInterval(t)
  }, [loadMachine, loadLogs, loadInspection])

  // debug
  const addLog = useCallback((title, message, type) => {
    const now = new Date(); const ts = now.toISOString()
    setLogs(prev => [{ log_type: type, title, message, timestamp: ts }, ...prev])
  }, [])

  const showAlert = useCallback((title, message) => {
    setAlert({ open: true, title, message })
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current)
    alertTimerRef.current = setTimeout(() => setAlert({ open: false, title: '', message: '' }), 5000)
  }, [])

  const onDebugError = useCallback(() => {
    const sample = [
      { code: 'モータートルク異常', message: 'モーターの負荷が規定値を超えました。' },
      { code: 'フェンス内異物検知', message: '安全フェンス内で異物を検知しました。' }
    ]
    const e = sample[Math.floor(Math.random() * sample.length)]
    setMachineBadge('error')
    addLog(e.code, e.message, 'error')
    showAlert(e.code, e.message)
    setOverallStatus('FAIL')
    const idx = Math.ceil(Math.random() * 4)
    setTiles(prev => prev.map(t => t.index === idx ? { ...t, status: 'FAIL' } : t))
  }, [addLog, showAlert])

  const onDebugWarning = useCallback(() => {
    setMachineBadge('warning')
    addLog('非常停止ボタン取り扱い', '非常停止ボタンが押されました。', 'warning')
  }, [addLog])

  const onDebugNormal = useCallback(() => {
    setMachineBadge('info')
    addLog('I-003: 状態リセット', '手動で正常状態に復帰しました。', 'info')
    setOverallStatus('PASS')
    setTiles(prev => prev.map(t => ({ ...t, status: 'PASS', failReason: '' })))
  }, [addLog])

  return {
    // time
    clock,
    // machine
    machineName, todayProdCount, lastInspectionDate, nextInspectionDate, todayUptimeSec, machineBadge,
    // logs
    logs,
    // inspection
    overallStatus, rotId, inspectionTime, tiles,
    // actions
    onDebugError, onDebugWarning, onDebugNormal,
    // util
    formatNumber,
    alert,
  }
}
