// ダミーデータ/今後API接続で置き換え予定
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SAMPLE_SUMMARIES } from '../data/sampleSummaries'
import { SAMPLE_LOTS } from '../data/sampleLots'

// 簡易トグル: trueでAPIを叩いてサマリー（総数/良品/不良/不良理由）を取得、falseでフロント側計算
const USE_API_SUMMARY = true;
// ロットログ（一覧）もAPIに切り替えるトグル
const USE_API_LOTS = true;

// 表示名 => 内部コード（APIのsectionクエリ）
const SECTION_TO_CODE = {
  'バネ留め': 'spring',
  'A層': 'alayer'
}

const CODE_TO_SECTION = Object.fromEntries(Object.entries(SECTION_TO_CODE).map(([display, code]) => [code, display]))

const todayYMD = () => {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const normalizeImagePath = path => {
  if (!path) return null
  const trimmed = String(path).trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) {
    const [protocol, rest] = trimmed.split('://')
    if (!rest) return trimmed
    return `${protocol}://${rest.replace(/\/{2,}/g, '/')}`
  }
  const cleaned = trimmed.replace(/\/{2,}/g, '/')
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`
}

const SHOT_DEFAULT_TYPE = 'DEFAULT'

const normalizeShotType = type => {
  if (!type) return SHOT_DEFAULT_TYPE
  const normalized = String(type).trim()
  return normalized ? normalized.toUpperCase() : SHOT_DEFAULT_TYPE
}

const buildShotCacheKey = (lotId, shotType) => `${lotId}|${normalizeShotType(shotType)}`

export const useLotsData = () => {
  // API仕様に合わせたダミー応答（将来は fetch で置き換え）
  const [apiPayload] = useState(SAMPLE_LOTS)

  // ---- サマリー(API) キャッシュ ----
  // key: `${sectionCode}|${date}`
  const [summaryCache, setSummaryCache] = useState({})

  const fetchSummary = async (sectionDisplayName, date) => {
    const sectionCode = SECTION_TO_CODE[sectionDisplayName]
    if (!sectionCode) return Promise.reject(new Error(`Unknown section: ${sectionDisplayName}`))
    const ymd = date || todayYMD()
    const cacheKey = `${sectionCode}|${ymd}`

    if (summaryCache[cacheKey]) return summaryCache[cacheKey]

    const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
    const qs = new URLSearchParams({ section: sectionCode, date: ymd }).toString()
    const res = await fetch(`${base}/api/inspections/summary?${qs}`)
    if (!res.ok) throw new Error(`Failed to fetch summary ${res.status}`)
    const data = await res.json()

    setSummaryCache(prev => ({ ...prev, [cacheKey]: data }))
    return data
  }

  // ローカル計算による API レスポンス形のサマリー生成
  const buildLocalSummary = (sectionDisplayName, date) => {
    const sectionCode = SECTION_TO_CODE[sectionDisplayName]
    const ymd = date || todayYMD()
    const sampleKey = `${sectionCode}|${ymd}`
    // 1) サンプルサマリーがあれば最優先で返す
    if (SAMPLE_SUMMARIES[sampleKey]) return SAMPLE_SUMMARIES[sampleKey]
    const lots = getSectionLots(sectionDisplayName, ymd)
    const total = lots.length
    const pass = lots.filter(l => getLotStatus(l) === 'PASS').length
    const fail = total - pass
    const passRate = total > 0 ? Math.round((pass / total) * 100) : 100

    const failedCameras = lots.flatMap(l => l.cameras.filter(c => c.status !== 'OK' && c.details && c.details !== '-'))
    const reasonCounts = failedCameras.reduce((acc, c) => {
      acc[c.details] = (acc[c.details] || 0) + 1
      return acc
    }, {})
    const failReasons = Object.entries(reasonCounts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)

    return {
      section: sectionCode,
      date: ymd,
      total_count: total,
      pass_count: pass,
      fail_count: fail,
      pass_rate: passRate,
      fail_reasons: failReasons
    }
  }

  // ---- アダプト層：APIデータ => 既存UI互換データ ----
  const normalizeSection = section => {
    if (!section) return section
    const mapped = CODE_TO_SECTION[section] || section
    return mapped.replace(/検査$/, '')
  }

  const toHHMMSS = iso => {
    try {
      const d = new Date(iso)
      const pad = n => String(n).padStart(2, '0')
      return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    } catch {
      return ''
    }
  }

  const toYMD = iso => {
    try {
      const d = new Date(iso)
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    } catch {
      return ''
    }
  }

  const mapStatusApiToUi = status => {
    const normalized = (status || '').toString().trim().toUpperCase()
    if (!normalized) return '-'
    if (normalized === 'PASS' || normalized === 'OK') return 'OK'
    if (normalized === 'FAIL' || normalized === 'NG') return 'NG'
    return normalized
  }

  // 同一 camera_id が複数ある場合はワースト優先（FAILが1つでもあればNG）
  const aggregateCameras = cameras => {
    const byId = new Map()

    for (const raw of cameras || []) {
      const cameraId = raw?.camera_id || raw?.cameraId || raw?.name
      if (!cameraId) continue
      const statusUi = mapStatusApiToUi(raw?.status)
      const details = raw?.details ?? '-'
      const imagePath = raw?.image_path || null
      const prev = byId.get(cameraId)

      if (!prev) {
        byId.set(cameraId, {
          name: cameraId,
          status: statusUi,
          rawStatus: raw?.status ?? '',
          details,
          image_path: imagePath,
          type: 'camera',
        })
      } else {
        const nextIsFail = statusUi !== 'OK'
        const prevIsFail = prev.status !== 'OK'

        if (nextIsFail && !prevIsFail) {
          prev.status = statusUi
          prev.rawStatus = raw?.status ?? prev.rawStatus
          prev.details = details
          prev.image_path = imagePath || prev.image_path
        }
      }
    }

    return Array.from(byId.values())
  }

  const mapFourKSequences = sequences => (sequences || []).map(seq => ({
    name: seq?.['c4k_seq'] ?? seq?.four_k_seq ?? seq?.seq ?? '-',
    status: mapStatusApiToUi(seq?.status),
    rawStatus: seq?.status ?? '',
    details: seq?.details ?? '-',
    type: 'sequence',
  }))

  const adaptLotToUi = lot => {
    const sectionDisplay = normalizeSection(lot.section)
    const overallStatus = typeof lot.pass === 'boolean' ? (lot.pass ? 'PASS' : 'FAIL') : undefined
    const cameraLikeItems = Array.isArray(lot.four_k_sequences) && lot.four_k_sequences.length > 0
      ? mapFourKSequences(lot.four_k_sequences)
      : aggregateCameras(lot.cameras)

    return {
      time: toHHMMSS(lot.captured_at),
      date: toYMD(lot.captured_at),
      timestamp: new Date(lot.captured_at).getTime(),
      section: sectionDisplay,
      sectionCode: typeof lot.section === 'string' ? lot.section : undefined,
      lotId: lot.lot_id,
      cameras: cameraLikeItems,
      overallStatus,
      representativeImage: normalizeImagePath(lot.representative_image),
    }
  }

  // セクションごとに時刻降順で整形したUI向けロット配列（サンプルデータベース）
  const uiLots = useMemo(() => {
    const lots = (apiPayload?.lots || []).map(adaptLotToUi)
    // captured_at 降順
    return lots.sort((a, b) => b.timestamp - a.timestamp)
  }, [apiPayload])

  useEffect(() => {
    if (!uiLots.length) return
    setLotUiIndex(prev => {
      const next = { ...prev }
      let changed = false
      for (const lot of uiLots) {
        if (next[lot.lotId] !== lot) {
          next[lot.lotId] = lot
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [uiLots])

  // ---- ロット一覧(API) 対応 ----
  // raw: APIの返却をページ結合して保存、ui: アダプト済み配列
  const [lotsRawCache, setLotsRawCache] = useState({}) // key: `${sectionCode}|${date}` -> { total_pages, lots: [...] }
  const [lotsUiCache, setLotsUiCache] = useState({})   // key: `${section}|${date}` (表示名) -> adapted[]
  const [lotRawIndex, setLotRawIndex] = useState({})   // key: lot_id -> raw lot
  const [lotUiIndex, setLotUiIndex] = useState({})     // key: lot_id -> adapted lot
  const [lotShotsCache, setLotShotsCache] = useState({}) // key: `${lot_id}|${shotType}` -> shots[]
  const [lotShotsStatus, setLotShotsStatus] = useState({}) // key: `${lot_id}|${shotType}` -> 'idle' | 'loading' | 'success' | 'error'
  const [datesCache, setDatesCache] = useState({})      // key: section display name -> [YYYY-MM-DD]

  // in-flight guards to prevent request storms
  const inFlightSummaryRef = useRef(new Set()) // keys: `${section}|${date}` (display name)
  const inFlightLotsRef = useRef(new Set())    // keys: `${sectionCode}|${date}`
  const inFlightShotsRef = useRef(new Set())   // keys: `${lot_id}|${shotType}`
  const inFlightDatesRef = useRef(new Set())   // keys: section display name
  const inFlightLotDetailRef = useRef(new Set()) // keys: lot_id

  const fetchLotsAllPages = async (sectionDisplayName, date, limit = 200) => {
    const sectionCode = SECTION_TO_CODE[sectionDisplayName]
    if (!sectionCode) throw new Error(`Unknown section: ${sectionDisplayName}`)
    const ymd = date || todayYMD()
    const cacheKeyRaw = `${sectionCode}|${ymd}`
    const cacheKeyUi = `${sectionDisplayName}|${ymd}`
    if (lotsRawCache[cacheKeyRaw] && lotsUiCache[cacheKeyUi]) return lotsUiCache[cacheKeyUi]
    if (inFlightLotsRef.current.has(cacheKeyRaw)) return undefined
    inFlightLotsRef.current.add(cacheKeyRaw)

    const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
    let page = 1
    let totalPages = 1
    const allLots = []

    while (page <= totalPages) {
      const qs = new URLSearchParams({ section: sectionCode, date: ymd, page: String(page), limit: String(limit) }).toString()
      const res = await fetch(`${base}/api/inspections/lots?${qs}`)
      if (!res.ok) throw new Error(`Failed to fetch lots ${res.status}`)
      const data = await res.json()
      totalPages = Number(data.total_pages || 1)
      page = Number(data.current_page || page) + 1
      if (Array.isArray(data.lots)) allLots.push(...data.lots)
    }

    const rawJoined = { total_pages: totalPages, current_page: 1, lots: allLots }
    setLotsRawCache(prev => ({ ...prev, [cacheKeyRaw]: rawJoined }))

    // インデックス更新
    setLotRawIndex(prev => {
      const next = { ...prev }
      for (const l of allLots) next[l.lot_id] = l
      return next
    })

    const adapted = (allLots || []).map(adaptLotToUi).sort((a, b) => b.timestamp - a.timestamp)
    setLotsUiCache(prev => ({ ...prev, [cacheKeyUi]: adapted }))
    setLotUiIndex(prev => {
      const next = { ...prev }
      let changed = false
      for (const lot of adapted) {
        if (next[lot.lotId] !== lot) {
          next[lot.lotId] = lot
          changed = true
        }
      }
      return changed ? next : prev
    })
    inFlightLotsRef.current.delete(cacheKeyRaw)
    return adapted
  }

  const fetchAvailableDates = async (sectionDisplayName) => {
    const sectionCode = SECTION_TO_CODE[sectionDisplayName]
    if (!sectionCode) throw new Error(`Unknown section: ${sectionDisplayName}`)
    if (datesCache[sectionDisplayName]) return datesCache[sectionDisplayName]
    if (inFlightDatesRef.current.has(sectionDisplayName)) return undefined
    inFlightDatesRef.current.add(sectionDisplayName)

    try {
      const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
      const res = await fetch(`${base}/api/inspections/sections/${encodeURIComponent(sectionCode)}/dates`)
      if (!res.ok) throw new Error(`Failed to fetch dates ${res.status}`)
      const data = await res.json()
      const dates = Array.isArray(data?.dates) ? data.dates : []
      setDatesCache(prev => ({ ...prev, [sectionDisplayName]: dates }))
      return dates
    } finally {
      inFlightDatesRef.current.delete(sectionDisplayName)
    }
  }

  const getSectionLots = (section, date) => {
    const normalized = normalizeSection(section)
    const ymd = date || todayYMD()
    if (USE_API_LOTS) {
      const cacheKeyUi = `${section}|${ymd}`
      const cached = lotsUiCache[cacheKeyUi]
      if (cached) return cached
      // 取得を発火（失敗時はサイレント）。日付未指定なら今日と解釈
      fetchLotsAllPages(section, ymd).catch(() => { })
      // フォールバック: サンプルから同期返却
      const filtered = uiLots.filter(l => l.section === normalized)
      return filtered.filter(l => l.date === ymd)
    }
    // サンプルモード
    const filtered = uiLots.filter(l => l.section === normalized)
    return filtered.filter(l => l.date === ymd)
  }

  const getLotStatus = lot => {
    if (!lot) return 'UNKNOWN'
    if (lot.overallStatus) return lot.overallStatus
    return (lot.cameras || []).every(c => c.status === 'OK') ? 'PASS' : 'FAIL'
  }

  // 同期API: UI互換のため、最新取得済みのAPI値を返却し、未取得ならリクエストを発火してローカル計算をフォールバック
  const [latestSummary, setLatestSummary] = useState({}) // key: `${section}|${date}` -> { total_count, pass_count, ... }

  const primeSummary = (section, date) => {
    const ymd = date || todayYMD()
    const key = `${section}|${ymd}`
    if (latestSummary[key]) return
    if (inFlightSummaryRef.current.has(key)) return
    if (USE_API_SUMMARY) {
      inFlightSummaryRef.current.add(key)
      fetchSummary(section, ymd)
        .then(data => setLatestSummary(prev => ({ ...prev, [key]: data })))
        .catch(() => { /* サイレント失敗 */ })
        .finally(() => { inFlightSummaryRef.current.delete(key) })
    } else {
      const local = buildLocalSummary(section, ymd)
      setLatestSummary(prev => ({ ...prev, [key]: local }))
    }
  }

  const getSectionStats = (section, _date) => {
    // サマリーは常に「今日」を対象とする
    const ymd = todayYMD()
    const key = `${section}|${ymd}`
    let api = latestSummary[key]
    if (!api) {
      // 値がなければ取得/生成
      primeSummary(section, ymd)
      // 即時用フォールバック（ローカル計算でAPI形）
      if (!USE_API_SUMMARY) api = buildLocalSummary(section, ymd)
    }
    if (api) {
      return {
        total: api.total_count ?? 0,
        pass: api.pass_count ?? 0,
        fail: api.fail_count ?? 0,
        passRate: api.pass_rate ?? (api.total_count ? Math.round((api.pass_count / api.total_count) * 100) : 100)
      }
    }
    // 最後の保険: 空
    return { total: 0, pass: 0, fail: 0, passRate: 100 }
  }

  const getFailReasons = (section, _date) => {
    // サマリーは常に「今日」を対象とする
    const ymd = todayYMD()
    const key = `${section}|${ymd}`
    let api = latestSummary[key]
    if (!api) {
      primeSummary(section, ymd)
      if (!USE_API_SUMMARY) api = buildLocalSummary(section, ymd)
    }
    if (api && Array.isArray(api.fail_reasons)) {
      const total = api.fail_reasons.reduce((s, r) => s + (r.count || 0), 0) || 0
      return api.fail_reasons.map(r => ({
        reason: r.reason,
        count: r.count,
        percentage: total ? Math.round((r.count / total) * 100) : 0
      }))
    }
    return []
  }

  const getLatestLot = (section, date) => getSectionLots(section, date)[0] || null

  // 利用可能な日付一覧（降順）
  const getAvailableDates = (section) => {
    if (USE_API_LOTS) {
      const cached = datesCache[section]
      if (cached) return cached
      // 未取得ならAPI発火し、フォールバックとしてサンプル由来の日付を返す
      fetchAvailableDates(section).catch(() => { })
    }
    const lots = getSectionLots(section)
    const set = new Set(lots.map(l => l.date))
    return Array.from(set).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
  }

  // ---- 詳細表示向けヘルパ ----
  const getLotShots = (lotId, options = {}) => {
    const shotTypeNormalized = normalizeShotType(options?.type)
    // APIモードでは詳細は遅延取得; キャッシュがなければ空配列を返す
    if (USE_API_LOTS) {
      const cached = lotShotsCache[buildShotCacheKey(lotId, shotTypeNormalized)]
      return Array.isArray(cached) ? cached : []
    }
    // サンプルモード: sampleLotsの埋め込み詳細を返却
    const lot = (apiPayload?.lots || []).find(l => l.lot_id === lotId)
    if (!lot) return []

    if (shotTypeNormalized === '4K') {
      const sequences = Array.isArray(lot.four_k_sequences) ? lot.four_k_sequences : []
      return sequences.map(seq => ({
        ...seq,
        image_path: seq?.image_path ? normalizeImagePath(seq.image_path) : seq?.image_path,
        ['c4k_seq']: seq?.['c4k_seq'] ?? seq?.four_k_seq ?? seq?.seq ?? null,
      }))
    }

    if (shotTypeNormalized !== SHOT_DEFAULT_TYPE) return []

    return (lot.cameras || []).map(c => ({
      camera_id: c.camera_id,
      status: c.status,
      details: c.details,
      image_path: c.image_path,
    }))
  }

  const ensureLotShotsLoaded = async (lotId, options = {}) => {
    if (!USE_API_LOTS) return
    if (!lotId) return
    const shotTypeNormalized = normalizeShotType(options?.type)
    const cacheKey = buildShotCacheKey(lotId, shotTypeNormalized)
    if (lotShotsCache[cacheKey]) {
      setLotShotsStatus(prev => (prev[cacheKey] === 'success' ? prev : { ...prev, [cacheKey]: 'success' }))
      return
    }
    if (inFlightShotsRef.current.has(cacheKey)) return
    inFlightShotsRef.current.add(cacheKey)
    setLotShotsStatus(prev => (prev[cacheKey] === 'loading' ? prev : { ...prev, [cacheKey]: 'loading' }))
    try {
      const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
      const typeSegment = shotTypeNormalized === SHOT_DEFAULT_TYPE ? '' : `/${encodeURIComponent(shotTypeNormalized)}`
      const res = await fetch(`${base}/api/inspections/lots/${encodeURIComponent(lotId)}/shots${typeSegment}`)
      if (!res.ok) throw new Error(`Failed to fetch shots ${res.status}`)
      const data = await res.json()
      const shots = Array.isArray(data?.shots) ? data.shots : []
      setLotShotsCache(prev => ({ ...prev, [cacheKey]: shots }))
      setLotShotsStatus(prev => ({ ...prev, [cacheKey]: 'success' }))
    } catch {
      setLotShotsStatus(prev => ({ ...prev, [cacheKey]: 'error' }))
    } finally {
      inFlightShotsRef.current.delete(cacheKey)
    }
  }

  const getLotShotsStatus = (lotId, options = {}) => {
    if (!lotId) return 'idle'
    const shotTypeNormalized = normalizeShotType(options?.type)
    const cacheKey = buildShotCacheKey(lotId, shotTypeNormalized)
    if (!USE_API_LOTS) {
      const lot = (apiPayload?.lots || []).find(l => l.lot_id === lotId)
      if (!lot) return 'idle'
      if (shotTypeNormalized === '4K') {
        const sequences = Array.isArray(lot.four_k_sequences) ? lot.four_k_sequences : []
        return sequences.length > 0 ? 'success' : 'success'
      }
      if (shotTypeNormalized !== SHOT_DEFAULT_TYPE) return 'success'
      const cameras = Array.isArray(lot.cameras) ? lot.cameras : []
      return cameras.length > 0 ? 'success' : 'success'
    }
    return lotShotsStatus[cacheKey] || (lotShotsCache[cacheKey] ? 'success' : 'idle')
  }

  const getLotShotsByCamera = (lotId, options = {}) => {
    const shots = getLotShots(lotId, options)

    const grouped = shots.reduce((acc, s) => {
      const key = s?.camera_id || s?.cameraId || s?.['c4k_seq'] || s?.four_k_seq || 'unknown'
      if (!acc[key]) acc[key] = []
      acc[key].push(s)
      return acc
    }, {})

    return grouped
  }

  const ensureLotLoaded = useCallback(async (lotId) => {
    if (!lotId) return null
    if (!USE_API_LOTS) {
      return uiLots.find(l => l.lotId === lotId) || null
    }
    if (lotUiIndex[lotId]) return lotUiIndex[lotId]
    if (lotRawIndex[lotId]) {
      const adapted = adaptLotToUi(lotRawIndex[lotId])
      setLotUiIndex(prev => {
        const prevLot = prev[lotId]
        if (prevLot && prevLot.timestamp === adapted.timestamp) return prev
        return { ...prev, [lotId]: adapted }
      })
      return adapted
    }
    if (inFlightLotDetailRef.current.has(lotId)) return null
    inFlightLotDetailRef.current.add(lotId)
    try {
      const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
      const res = await fetch(`${base}/api/inspections/lots/${encodeURIComponent(lotId)}`)
      if (!res.ok) throw new Error(`Failed to fetch lot ${res.status}`)
      const data = await res.json()
      const rawLot = data?.lot || data
      if (!rawLot || !rawLot.lot_id) return null

      setLotRawIndex(prev => ({ ...prev, [rawLot.lot_id]: rawLot }))

      const adapted = adaptLotToUi(rawLot)
      setLotUiIndex(prev => ({ ...prev, [adapted.lotId]: adapted }))

      const sectionName = adapted.section
      const date = adapted.date

      if (sectionName && date) {
        const cacheKeyUi = `${sectionName}|${date}`
        setLotsUiCache(prev => {
          const existing = prev[cacheKeyUi] || []
          if (existing.some(l => l.lotId === adapted.lotId)) return prev
          const updated = [...existing, adapted].sort((a, b) => b.timestamp - a.timestamp)
          return { ...prev, [cacheKeyUi]: updated }
        })

        setDatesCache(prev => {
          const prevDates = prev[sectionName] || []
          if (prevDates.includes(date)) return prev
          const nextDates = [...prevDates, date].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
          return { ...prev, [sectionName]: nextDates }
        })
      }

      return adapted
    } catch {
      return null
    } finally {
      inFlightLotDetailRef.current.delete(lotId)
    }
  }, [lotRawIndex, lotUiIndex, uiLots])

  const getLotById = useCallback((lotId) => {
    if (!lotId) return null
    if (lotUiIndex[lotId]) return lotUiIndex[lotId]
    if (lotRawIndex[lotId]) return adaptLotToUi(lotRawIndex[lotId])
    return uiLots.find(l => l.lotId === lotId) || null
  }, [lotUiIndex, lotRawIndex, uiLots])

  // 初期プリフェッチ（APIモード時）: セクションごと最新日を先読み
  useEffect(() => {
    const sections = Object.keys(SECTION_TO_CODE)
    const ymd = todayYMD()
    // サマリー（今日）: 既にin-flight or 取得済みならスキップ
    sections.forEach(sec => {
      const key = `${sec}|${ymd}`
      if (!latestSummary[key] && !inFlightSummaryRef.current.has(key)) primeSummary(sec, ymd)
    })
    // ロット（今日）: 既にキャッシュ or in-flightならスキップ
    if (USE_API_LOTS) {
      sections.forEach(sec => {
        const code = SECTION_TO_CODE[sec]
        const rawKey = `${code}|${ymd}`
        const uiKey = `${sec}|${ymd}`
        if (!lotsRawCache[rawKey] && !lotsUiCache[uiKey] && !inFlightLotsRef.current.has(rawKey)) {
          fetchLotsAllPages(sec, ymd).catch(() => { })
        }
      })
      // 利用可能日付もプリフェッチ
      sections.forEach(sec => {
        if (!datesCache[sec] && !inFlightDatesRef.current.has(sec)) fetchAvailableDates(sec).catch(() => { })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestSummary, lotsRawCache, lotsUiCache, datesCache])

  return {
    // 既存UIが参照する互換データ
    lotsData: uiLots,

    // 必要であれば生API形も公開（将来の統合向け）
    apiPayload,
    getSectionLots,
    getLotStatus,
    getSectionStats,
    getFailReasons,
    getLatestLot,
    getAvailableDates,
    getLotShots,
    getLotShotsByCamera,
    getLotShotsStatus,
    getLotById,
    ensureLotLoaded,
    ensureLotShotsLoaded,
  }
}
