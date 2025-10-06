// ダミーデータ/今後API接続で置き換え予定
import { useMemo, useState } from 'react'

export const useLotsData = () => {
    const [lotsData] = useState([
        // バネ留め（4カメラ）
        {
            time: '10:20:12',
            section: 'バネ留め',
            lotId: 'SPR-LOT-0010',
            cameras: [
                { name: 'B-spring01', status: 'OK', details: '-' },
                { name: 'B-spring02', status: 'OK', details: '-' },
                { name: 'B-spring03', status: 'OK', details: '-' },
                { name: 'B-spring04', status: 'OK', details: '-' },
            ],
        },
        {
            time: '10:18:04',
            section: 'バネ留め',
            lotId: 'SPR-LOT-0009',
            cameras: [
                { name: 'カメラ1', status: 'OK', details: '-' },
                { name: 'カメラ2', status: 'NG', details: '位置ずれ' },
                { name: 'カメラ3', status: 'OK', details: '-' },
                { name: 'カメラ4', status: 'OK', details: '-' },
            ],
        },
        {
            time: '10:16:51',
            section: 'バネ留め',
            lotId: 'SPR-LOT-0008',
            cameras: [
                { name: 'カメラ1', status: 'OK', details: '-' },
                { name: 'カメラ2', status: 'OK', details: '-' },
                { name: 'カメラ3', status: 'OK', details: '-' },
                { name: 'カメラ4', status: 'NG', details: '欠け' },
            ],
        },
        // A層（3カメラ）
        {
            time: '10:18:12',
            section: 'A層',
            lotId: 'AL-LOT-01249',
            cameras: [
                { name: 'A-main01', status: 'OK', details: '-' },
                { name: 'A-stitch01', status: 'OK', details: '-' },
                { name: 'A-stitch02', status: 'OK', details: '-' },
            ],
        },
        {
            time: '10:17:51',
            section: 'A層',
            lotId: 'AL-LOT-01248',
            cameras: [
                { name: 'カメラ1', status: 'NG', details: '傷あり' },
                { name: 'カメラ2', status: 'OK', details: '-' },
                { name: 'カメラ3', status: 'OK', details: '-' },
            ],
        },
        {
            time: '10:15:04',
            section: 'A層',
            lotId: 'AL-LOT-01247',
            cameras: [
                { name: 'カメラ1', status: 'OK', details: '-' },
                { name: 'カメラ2', status: 'NG', details: '異物混入' },
                { name: 'カメラ3', status: 'OK', details: '-' },
            ],
        },
    ])

    const getSectionLots = section => lotsData.filter(l => l.section === section)
    const getLotStatus = lot => (lot.cameras.every(c => c.status === 'OK') ? 'PASS' : 'FAIL')

    const getSectionStats = section => {
        const lots = getSectionLots(section)
        const total = lots.length
        const pass = lots.filter(l => getLotStatus(l) === 'PASS').length
        const fail = total - pass
        const passRate = total > 0 ? Math.round((pass / total) * 100) : 100
        return { total, pass, fail, passRate }
    }

    const getFailReasons = section => {
        const lots = getSectionLots(section)
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

    const getLatestLot = section => getSectionLots(section)[0] || null

    return {
        lotsData,
        getSectionLots,
        getLotStatus,
        getSectionStats,
        getFailReasons,
        getLatestLot,
    }
}
