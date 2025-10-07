// ダミーデータ/今後API接続で置き換え予定
import { useMemo, useState } from 'react'

export const useLotsData = () => {
    // API仕様に合わせたダミー応答（将来は fetch で置き換え）
    const [apiPayload] = useState({
        total_pages: 1,
        current_page: 1,
        lots: [
            // --- 2025-09-30 分 ---
            {
                lot_id: 'MAT-09030-01',
                section: 'バネ留め',
                captured_at: '2025-09-30T09:15:12.000Z',
                pass: true,
                cameras: [
                    { camera_id: 'B-spring01', status: 'PASS', details: null, image_path: 'MAT-09030-01_B-spring01-01.jpg' },
                    { camera_id: 'B-spring02', status: 'PASS', details: null, image_path: 'MAT-09030-01_B-spring02-01.jpg' },
                    { camera_id: 'B-spring03', status: 'PASS', details: null, image_path: 'MAT-09030-01_B-spring03-01.jpg' },
                    { camera_id: 'B-spring04', status: 'PASS', details: null, image_path: 'MAT-09030-01_B-spring04-01.jpg' }
                ],
            },
            {
                lot_id: 'MAT-09030-02',
                section: 'バネ留め',
                captured_at: '2025-09-30T10:45:45.000Z',
                pass: false,
                cameras: [
                    { camera_id: 'B-spring01', status: 'FAIL', details: 'バネ外れ', image_path: 'MAT-09030-02_B-spring01-01.jpg' },
                    { camera_id: 'B-spring02', status: 'PASS', details: null, image_path: 'MAT-09030-02_B-spring02-01.jpg' },
                    { camera_id: 'B-spring03', status: 'PASS', details: null, image_path: 'MAT-09030-02_B-spring03-01.jpg' },
                    { camera_id: 'B-spring04', status: 'PASS', details: null, image_path: 'MAT-09030-02_B-spring04-01.jpg' }
                ],
            },
            {
                lot_id: 'LOLL-09030-01',
                section: 'A層検査',
                captured_at: '2025-09-30T11:05:30.000Z',
                pass: false,
                cameras: [
                    { camera_id: 'A-main01', status: 'FAIL', details: 'A層ヨゴレ', image_path: 'LOLL-09030-01_A-main01-01.jpg' },
                    { camera_id: 'A-stitch01', status: 'PASS', details: null, image_path: 'LOLL-09030-01_A-stitch01-01.jpg' },
                    { camera_id: 'A-stitch02', status: 'PASS', details: null, image_path: 'LOLL-09030-01_A-stitch02-01.jpg' },
                ],
            },
            {
                lot_id: 'LOLL-09030-02',
                section: 'A層検査',
                captured_at: '2025-09-30T13:22:10.000Z',
                pass: true,
                cameras: [
                    { camera_id: 'A-main01', status: 'PASS', details: null, image_path: 'LOLL-09030-02_A-main01-01.jpg' },
                    { camera_id: 'A-stitch01', status: 'PASS', details: null, image_path: 'LOLL-09030-02_A-stitch01-01.jpg' },
                    { camera_id: 'A-stitch02', status: 'PASS', details: null, image_path: 'LOLL-09030-02_A-stitch02-01.jpg' },
                ],
            },

            {
                lot_id: 'MAT-10001',
                section: 'バネ留め',
                captured_at: '2025-10-01T17:47:53.427Z',
                pass: false,
                cameras: [
                    { camera_id: 'B-spring01', status: 'FAIL', details: 'バネ取り付け角度規定外', image_path: 'MAT-10001_B-spring01-01.jpg' },
                    { camera_id: 'B-spring01', status: 'PASS', details: null, image_path: 'MAT-10001_B-spring01-02.jpg' },
                    { camera_id: 'B-spring02', status: 'FAIL', details: 'バネ取り付け角度規定外', image_path: 'MAT-10001_B-spring02-01.jpg' },
                    { camera_id: 'B-spring02', status: 'PASS', details: null, image_path: 'MAT-10001_B-spring02-02.jpg' },
                    { camera_id: 'B-spring03', status: 'PASS', details: null, image_path: 'MAT-10001_B-spring03-01.jpg' },
                    { camera_id: 'B-spring03', status: 'PASS', details: null, image_path: 'MAT-10001_B-spring03-02.jpg' },
                    { camera_id: 'B-spring04', status: 'PASS', details: null, image_path: 'MAT-10001_B-spring04-01.jpg' },
                    { camera_id: 'B-spring04', status: 'PASS', details: null, image_path: 'MAT-10001_B-spring04-02.jpg' }
                ],
            },
            {
                lot_id: 'MAT-10002',
                section: 'バネ留め',
                captured_at: '2025-10-01T17:50:12.123Z',
                pass: true,
                cameras: [
                    { camera_id: 'B-spring01', status: 'PASS', details: null, image_path: 'MAT-10002_B-spring01-01.jpg' },
                    { camera_id: 'B-spring02', status: 'PASS', details: null, image_path: 'MAT-10002_B-spring02-01.jpg' },
                    { camera_id: 'B-spring03', status: 'PASS', details: null, image_path: 'MAT-10002_B-spring03-01.jpg' },
                    { camera_id: 'B-spring04', status: 'PASS', details: null, image_path: 'MAT-10002_B-spring04-01.jpg' }
                ],
            },
            {
                lot_id: 'MAT-10003',
                section: 'バネ留め',
                captured_at: '2025-10-01T17:52:30.555Z',
                pass: false,
                cameras: [
                    { camera_id: 'B-spring01', status: 'FAIL', details: 'バネ外れ', image_path: 'MAT-10003_B-spring01-01.jpg' },
                    { camera_id: 'B-spring02', status: 'PASS', details: null, image_path: 'MAT-10003_B-spring02-01.jpg' },
                    { camera_id: 'B-spring03', status: 'PASS', details: null, image_path: 'MAT-10003_B-spring03-01.jpg' },
                    { camera_id: 'B-spring04', status: 'PASS', details: null, image_path: 'MAT-10003_B-spring04-01.jpg' }
                ],
            },
            {
                lot_id: 'LOLL-10001',
                section: 'A層検査',
                captured_at: '2025-10-01T17:47:53.427Z',
                pass: false,
                cameras: [
                    { camera_id: 'A-main01', status: 'FAIL', details: 'A層ヨゴレ', image_path: 'LOLL-10001_A-main01-01.jpg' },
                    { camera_id: 'A-main01', status: 'FAIL', details: 'ゴミ付着', image_path: 'LOLL-10001_A-main01-02.jpg' },
                    { camera_id: 'A-main01', status: 'PASS', details: null, image_path: 'LOLL-10001_A-main01-03.jpg' },
                    { camera_id: 'A-main01', status: 'PASS', details: null, image_path: 'LOLL-10001_A-main01-04.jpg' },
                    { camera_id: 'A-stitch01', status: 'PASS', details: null, image_path: 'LOLL-10001_A-stitch01-01.jpg' },
                    { camera_id: 'A-stitch01', status: 'FAIL', details: '糸ほつれ', image_path: 'LOLL-10001_A-stitch01-02.jpg' },
                    { camera_id: 'A-stitch02', status: 'PASS', details: null, image_path: 'LOLL-10001_A-stitch02-03.jpg' },
                    { camera_id: 'A-stitch02', status: 'PASS', details: null, image_path: 'LOLL-10001_A-stitch02-04.jpg' },
                ],
            },
            {
                lot_id: 'LOLL-10002',
                section: 'A層検査',
                captured_at: '2025-10-01T17:49:10.789Z',
                pass: true,
                cameras: [
                    { camera_id: 'A-main01', status: 'PASS', details: null, image_path: 'LOLL-10002_A-main01-01.jpg' },
                    { camera_id: 'A-stitch01', status: 'PASS', details: null, image_path: 'LOLL-10002_A-stitch01-01.jpg' },
                    { camera_id: 'A-stitch02', status: 'PASS', details: null, image_path: 'LOLL-10002_A-stitch02-01.jpg' },
                ],
            },
            {
                lot_id: 'LOLL-10003',
                section: 'A層検査',
                captured_at: '2025-10-01T17:51:05.321Z',
                pass: false,
                cameras: [
                    { camera_id: 'A-main01', status: 'FAIL', details: 'A層ヨゴレ', image_path: 'LOLL-10003_A-main01-01.jpg' },
                    { camera_id: 'A-stitch01', status: 'PASS', details: null, image_path: 'LOLL-10003_A-stitch01-01.jpg' },
                    { camera_id: 'A-stitch02', status: 'FAIL', details: '糸ほつれ', image_path: 'LOLL-10003_A-stitch02-01.jpg' },
                ],
            },

            // --- 2025-10-02 分 ---
            {
                lot_id: 'MAT-10002-01',
                section: 'バネ留め',
                captured_at: '2025-10-02T01:10:00.000Z',
                pass: true,
                cameras: [
                    { camera_id: 'B-spring01', status: 'PASS', details: null, image_path: 'MAT-10002-01_B-spring01-01.jpg' },
                    { camera_id: 'B-spring02', status: 'PASS', details: null, image_path: 'MAT-10002-01_B-spring02-01.jpg' },
                    { camera_id: 'B-spring03', status: 'PASS', details: null, image_path: 'MAT-10002-01_B-spring03-01.jpg' },
                    { camera_id: 'B-spring04', status: 'PASS', details: null, image_path: 'MAT-10002-01_B-spring04-01.jpg' }
                ],
            },
            {
                lot_id: 'MAT-10002-02',
                section: 'バネ留め',
                captured_at: '2025-10-02T03:30:45.000Z',
                pass: false,
                cameras: [
                    { camera_id: 'B-spring01', status: 'PASS', details: null, image_path: 'MAT-10002-02_B-spring01-01.jpg' },
                    { camera_id: 'B-spring02', status: 'FAIL', details: 'バネ取り付け角度規定外', image_path: 'MAT-10002-02_B-spring02-01.jpg' },
                    { camera_id: 'B-spring03', status: 'PASS', details: null, image_path: 'MAT-10002-02_B-spring03-01.jpg' },
                    { camera_id: 'B-spring04', status: 'PASS', details: null, image_path: 'MAT-10002-02_B-spring04-01.jpg' }
                ],
            },
            {
                lot_id: 'LOLL-10002-01',
                section: 'A層検査',
                captured_at: '2025-10-02T04:00:00.000Z',
                pass: true,
                cameras: [
                    { camera_id: 'A-main01', status: 'PASS', details: null, image_path: 'LOLL-10002-01_A-main01-01.jpg' },
                    { camera_id: 'A-stitch01', status: 'PASS', details: null, image_path: 'LOLL-10002-01_A-stitch01-01.jpg' },
                    { camera_id: 'A-stitch02', status: 'PASS', details: null, image_path: 'LOLL-10002-01_A-stitch02-01.jpg' },
                ],
            },
            {
                lot_id: 'LOLL-10002-02',
                section: 'A層検査',
                captured_at: '2025-10-02T05:45:15.000Z',
                pass: false,
                cameras: [
                    { camera_id: 'A-main01', status: 'FAIL', details: 'ゴミ付着', image_path: 'LOLL-10002-02_A-main01-01.jpg' },
                    { camera_id: 'A-stitch01', status: 'PASS', details: null, image_path: 'LOLL-10002-02_A-stitch01-01.jpg' },
                    { camera_id: 'A-stitch02', status: 'PASS', details: null, image_path: 'LOLL-10002-02_A-stitch02-01.jpg' },
                ],
            },
        ],
    })

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

    // セクションごとに時刻降順で整形したUI向けロット配列
    const uiLots = useMemo(() => {
        const lots = (apiPayload?.lots || []).map(adaptLotToUi)
        // captured_at 降順
        return lots.sort((a, b) => b.timestamp - a.timestamp)
    }, [apiPayload])

    const getSectionLots = (section, date) => {
        const normalized = normalizeSection(section)
        const filtered = uiLots.filter(l => l.section === normalized)
        return date ? filtered.filter(l => l.date === date) : filtered
    }
    const getLotStatus = lot => (lot.cameras.every(c => c.status === 'OK') ? 'PASS' : 'FAIL')

    const getSectionStats = (section, date) => {
        const lots = getSectionLots(section, date)
        const total = lots.length
        const pass = lots.filter(l => getLotStatus(l) === 'PASS').length
        const fail = total - pass
        const passRate = total > 0 ? Math.round((pass / total) * 100) : 100
        return { total, pass, fail, passRate }
    }

    const getFailReasons = (section, date) => {
        const lots = getSectionLots(section, date)
        const failedCameras = lots.flatMap(l => l.cameras.filter(c => c.status !== 'OK' && c.details && c.details !== '-'))
        if (failedCameras.length === 0) return []
        const counts = failedCameras.reduce((acc, c) => {
            acc[c.details] = (acc[c.details] || 0) + 1
            return acc
        }, {})
        return Object.entries(counts)
            .map(([reason, count]) => ({ reason, count, percentage: Math.round((count / failedCameras.length) * 100) }))
            .sort((a, b) => b.count - a.count)
    }

    const getLatestLot = (section, date) => getSectionLots(section, date)[0] || null

    // 利用可能な日付一覧（降順）
    const getAvailableDates = (section) => {
        const lots = getSectionLots(section)
        const set = new Set(lots.map(l => l.date))
        return Array.from(set).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
    }

    // ---- 詳細表示向けヘルパ ----
    const getLotShots = lotId => {
        const lot = (apiPayload?.lots || []).find(l => l.lot_id === lotId)
        return lot ? (lot.cameras || []).map(c => ({
            camera_id: c.camera_id,
            status: c.status, // PASS | FAIL（生のまま）
            details: c.details,
            image_path: c.image_path,
        })) : []
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
    }
}
