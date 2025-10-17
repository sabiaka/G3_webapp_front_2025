// ダミーデータ/今後API接続で置き換え予定
import { useEffect, useMemo, useRef, useState } from 'react'
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

const todayYMD = () => {
    const d = new Date()
    const pad = n => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

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
        // 末尾の「検査」を取り除く（例: "A層検査" => "A層"）
        if (!section) return section
        
return section.replace(/検査$/, '')
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

    const mapStatusApiToUi = s => (s === 'PASS' ? 'OK' : 'NG')

    // 同一 camera_id が複数ある場合はワースト優先（FAILが1つでもあればNG）
    const aggregateCameras = cameras => {
        const byId = new Map()

        for (const c of cameras || []) {
            const prev = byId.get(c.camera_id)

            if (!prev) {
                byId.set(c.camera_id, {
                    name: c.camera_id,
                    status: mapStatusApiToUi(c.status),
                    details: c.details ?? '-',
                    image_path: c.image_path || null,
                })
            } else {
                // 既存がOKで新しいのがNGならNGへ、detailsもFAIL側を保持
                const nextIsFail = c.status === 'FAIL'
                const prevIsFail = prev.status !== 'OK'

                if (nextIsFail && !prevIsFail) {
                    prev.status = 'NG'
                    prev.details = c.details ?? prev.details
                    prev.image_path = c.image_path || prev.image_path
                }
            }
        }

        
return Array.from(byId.values())
    }

    const adaptLotToUi = lot => ({
        time: toHHMMSS(lot.captured_at),
        date: toYMD(lot.captured_at),
        timestamp: new Date(lot.captured_at).getTime(),
        section: normalizeSection(lot.section),
        lotId: lot.lot_id,
        cameras: aggregateCameras(lot.cameras),

        // 参考: 総合判定は既存関数 getLotStatus で算出
    })

    // セクションごとに時刻降順で整形したUI向けロット配列（サンプルデータベース）
    const uiLots = useMemo(() => {
        const lots = (apiPayload?.lots || []).map(adaptLotToUi)
        // captured_at 降順
        return lots.sort((a, b) => b.timestamp - a.timestamp)
    }, [apiPayload])

    // ---- ロット一覧(API) 対応 ----
    // raw: APIの返却をページ結合して保存、ui: アダプト済み配列
    const [lotsRawCache, setLotsRawCache] = useState({}) // key: `${sectionCode}|${date}` -> { total_pages, lots: [...] }
    const [lotsUiCache, setLotsUiCache] = useState({})   // key: `${section}|${date}` (表示名) -> adapted[]
    const [lotRawIndex, setLotRawIndex] = useState({})   // key: lot_id -> raw lot
    const [lotShotsCache, setLotShotsCache] = useState({}) // key: lot_id -> shots[]
    const [datesCache, setDatesCache] = useState({})      // key: section display name -> [YYYY-MM-DD]

    // in-flight guards to prevent request storms
    const inFlightSummaryRef = useRef(new Set()) // keys: `${section}|${date}` (display name)
    const inFlightLotsRef = useRef(new Set())    // keys: `${sectionCode}|${date}`
    const inFlightShotsRef = useRef(new Set())   // keys: lot_id
    const inFlightDatesRef = useRef(new Set())   // keys: section display name

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
            fetchLotsAllPages(section, ymd).catch(() => {})
            // フォールバック: サンプルから同期返却
            const filtered = uiLots.filter(l => l.section === normalized)
            return filtered.filter(l => l.date === ymd)
        }
        // サンプルモード
        const filtered = uiLots.filter(l => l.section === normalized)
        return filtered.filter(l => l.date === ymd)
    }

    const getLotStatus = lot => (lot.cameras.every(c => c.status === 'OK') ? 'PASS' : 'FAIL')

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
            fetchAvailableDates(section).catch(() => {})
        }
        const lots = getSectionLots(section)
        const set = new Set(lots.map(l => l.date))
        return Array.from(set).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
    }

    // ---- 詳細表示向けヘルパ ----
    const getLotShots = lotId => {
        // APIモードでは詳細は遅延取得; キャッシュがなければ空配列を返す
        if (USE_API_LOTS) {
            const cached = lotShotsCache[lotId]
            return Array.isArray(cached) ? cached : []
        }
        // サンプルモード: sampleLotsの埋め込み詳細を返却
        const lot = (apiPayload?.lots || []).find(l => l.lot_id === lotId)
        return lot ? (lot.cameras || []).map(c => ({
            camera_id: c.camera_id,
            status: c.status,
            details: c.details,
            image_path: c.image_path,
        })) : []
    }

    const ensureLotShotsLoaded = async lotId => {
        if (!USE_API_LOTS) return
        if (lotShotsCache[lotId]) return
        if (inFlightShotsRef.current.has(lotId)) return
        inFlightShotsRef.current.add(lotId)
        try {
            const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
            const res = await fetch(`${base}/api/inspections/lots/${encodeURIComponent(lotId)}/shots`)
            if (!res.ok) throw new Error(`Failed to fetch shots ${res.status}`)
            const data = await res.json()
            const shots = Array.isArray(data?.shots) ? data.shots : []
            setLotShotsCache(prev => ({ ...prev, [lotId]: shots }))
        } catch {
            // no-op
        } finally {
            inFlightShotsRef.current.delete(lotId)
        }
    }

    const getLotShotsByCamera = lotId => {
        const shots = getLotShots(lotId)

        const grouped = shots.reduce((acc, s) => {
            if (!acc[s.camera_id]) acc[s.camera_id] = []
            acc[s.camera_id].push(s)
            
return acc
        }, {})

        
return grouped
    }

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
                    fetchLotsAllPages(sec, ymd).catch(() => {})
                }
            })
            // 利用可能日付もプリフェッチ
            sections.forEach(sec => {
                if (!datesCache[sec] && !inFlightDatesRef.current.has(sec)) fetchAvailableDates(sec).catch(() => {})
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
        ensureLotShotsLoaded,
    }
}
