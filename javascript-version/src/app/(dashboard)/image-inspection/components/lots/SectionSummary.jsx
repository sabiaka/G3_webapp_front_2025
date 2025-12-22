// 最新ロットの結果と各カメラの判定をまとめて表示するサマリー行コンポーネント

import { useEffect, useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

const normalizeStatus = status => (status || '').toString().trim().toUpperCase()

const cameraChipColor = status => {
  const normalized = normalizeStatus(status)
  if (normalized === 'OK') return 'success'
  if (normalized === 'NG') return 'error'
  if (normalized === 'MISSING') return 'warning'
  return 'default'
}

const SUMMARY_THRESHOLD = 8

const getStatusPriority = status => {
  const normalized = (status || '').toString().trim().toUpperCase()
  if (normalized === 'NG') return 0
  if (normalized === 'MISSING') return 1
  if (normalized === 'FAIL') return 2
  if (normalized === 'OK') return 3
  if (normalized === 'UNKNOWN') return 4
  return 5
}

const resolveDisplayName = (item, index) => {
  const candidates = [item?.name, item?.label, item?.camera_id, item?.cameraId, item?.rawSequence]
  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) continue
    const text = String(candidate).trim()
    if (!text || text === '-' || text === '--') continue
    return text
  }
  return `#${index + 1}`
}

const SectionSummary = ({ latestLot, lotStatus }) => {
  const cameraList = useMemo(() => {
    if (latestLot && Array.isArray(latestLot.cameras)) return latestLot.cameras
    return []
  }, [latestLot])

  const shouldSummarize = cameraList.length > SUMMARY_THRESHOLD
  const [showAllChips, setShowAllChips] = useState(false)
  const showDetailedChips = !shouldSummarize || showAllChips

  useEffect(() => {
    setShowAllChips(false)
  }, [latestLot?.lotId])

  const normalizedLotStatus = normalizeStatus(lotStatus)
  const lotStatusColor = normalizedLotStatus === 'PASS'
    ? 'success.main'
    : normalizedLotStatus === 'FAIL'
      ? 'error.main'
      : normalizedLotStatus === 'MISSING'
        ? 'warning.main'
        : 'text.secondary'

  const failedCams = cameraList.filter(c => normalizeStatus(c.status) !== 'OK')

  const chipSummary = useMemo(() => {
    if (!shouldSummarize) return []
    const summaryMap = new Map()

    cameraList.forEach(item => {
      const statusValue = (item?.status ?? 'UNKNOWN').toString().trim()
      const displayLabel = statusValue || 'UNKNOWN'
      const normalized = displayLabel.toUpperCase()
      const existing = summaryMap.get(normalized)

      if (existing) {
        existing.count += 1
      } else {
        summaryMap.set(normalized, {
          normalized,
          displayLabel,
          count: 1,
        })
      }
    })

    return Array.from(summaryMap.values()).sort((a, b) => {
      const priorityDiff = getStatusPriority(a.normalized) - getStatusPriority(b.normalized)
      if (priorityDiff !== 0) return priorityDiff
      if (b.count !== a.count) return b.count - a.count
      return a.displayLabel.localeCompare(b.displayLabel)
    })
  }, [cameraList, shouldSummarize])

  if (!latestLot) return <Typography color="text.secondary">本日のロットデータはありません。</Typography>

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,

        // 親は折り返さず左右を1行に固定。右側内部のチップのみ折り返す
        flexWrap: 'nowrap',
      }}
    >
      {/* 左側: 固定幅寄りにして過度に広がらない */}
      <Box sx={{ flex: '0 0 auto', minWidth: 220 }}>
        <Typography variant="body2" color="text.secondary">{latestLot.time}</Typography>
        <Typography variant="h5" fontWeight="bold">{latestLot.lotId}</Typography>
        {['FAIL', 'MISSING'].includes(normalizedLotStatus) && failedCams.length > 0 && (
          <Typography variant="body2" color={normalizedLotStatus === 'FAIL' ? 'error.main' : 'warning.main'} sx={{ mt: 0.5 }}>
            {normalizedLotStatus === 'FAIL' ? '不良' : '要確認'}: {failedCams.map((c, index) => {
              const label = resolveDisplayName(c, index)
              const detailText = c?.details && c.details !== '-' ? `（${c.details}）` : ''
              return `${label}${detailText}`
            }).join('、')}
          </Typography>
        )}
      </Box>
      {/* 右側: 余白を受け持ち、内部でチップのみ折り返し */}
      <Box sx={{ textAlign: 'right', flex: '1 1 0', minWidth: 0 }}>
        <Typography variant="h4" fontWeight="bold" color={lotStatusColor}>
          {normalizedLotStatus || '-'}
        </Typography>
        {shouldSummarize && (
          <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end', flexWrap: 'wrap', maxWidth: '100%' }}>
            {chipSummary.map(summary => (
              <Chip
                key={summary.normalized}
                label={`${summary.displayLabel}: ${summary.count}件`}
                size="small"
                color={cameraChipColor(summary.displayLabel)}
                variant={summary.normalized === 'OK' ? 'outlined' : 'filled'}
              />
            ))}
          </Box>
        )}
        {showDetailedChips && (
          <Box sx={{ display: 'flex', gap: 1, mt: shouldSummarize ? 1 : 1, justifyContent: 'flex-end', flexWrap: 'wrap', maxWidth: '100%' }}>
            {cameraList.map((c, i) => {
              const label = resolveDisplayName(c, i)
              const statusLabel = c?.status || 'UNKNOWN'
              return (
                <Chip
                  key={`${label}-${i}`}
                  label={`${label}: ${statusLabel}`}
                  size="small"
                  color={cameraChipColor(statusLabel)}
                  variant={normalizeStatus(statusLabel) === 'OK' ? 'outlined' : 'filled'}
                />
              )
            })}
          </Box>
        )}
        {shouldSummarize && (
          <Button
            size="small"
            variant="text"
            onClick={() => setShowAllChips(prev => !prev)}
            sx={{ mt: 1, px: 0 }}
          >
            {showAllChips ? '概要に戻す' : `詳細を見る (${cameraList.length}項目)`}
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default SectionSummary
