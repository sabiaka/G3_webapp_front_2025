// モーダル内ロット情報セクションコンポーネント

import { useEffect, useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

import ShotsSummaryBlock from './ShotsSummaryBlock'
import { normalizeShotSummary } from '../../utils/summaryUtils'

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

const LotInfoSection = ({
  lot,
  representativeSources,
  handleImageError,
  setLightbox,
  getChipColor,
  statusItems,
  summary,
  summaryItems,
  summaryLabel = '検査サマリー',
  additionalSummaries = [],
}) => {
  if (!lot) return null

  const handlePreview = () => {
    if (!setLightbox) return
    setLightbox({
      open: true,
      src: representativeSources.primary,
      fallback: representativeSources.fallback,
      alt: lot.representativeImage ? `${lot.lotId} representative` : 'placeholder',
    })
  }

  const chips = Array.isArray(statusItems) && statusItems.length > 0 ? statusItems : lot.cameras || []
  const normalizedAdditionalSummaries = Array.isArray(additionalSummaries) ? additionalSummaries : []

  const shouldSummarize = chips.length > SUMMARY_THRESHOLD
  const [showAllChips, setShowAllChips] = useState(false)
  const showDetailedChips = !shouldSummarize || showAllChips

  useEffect(() => {
    setShowAllChips(false)
  }, [lot?.lotId])

  const chipSummary = useMemo(() => {
    if (!shouldSummarize) return []
    const summaryMap = new Map()

    chips.forEach(item => {
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
  }, [chips, shouldSummarize])

  const summaryBlocks = []
  const primaryFallbackItems = Array.isArray(summaryItems) ? summaryItems : chips
  const primarySummary = normalizeShotSummary(summary, primaryFallbackItems)
  if (primarySummary) {
    summaryBlocks.push({ label: summaryLabel, data: primarySummary })
  }

  normalizedAdditionalSummaries.forEach((entry, index) => {
    const resolved = normalizeShotSummary(entry?.summary, entry?.items)
    if (resolved) {
      summaryBlocks.push({ label: entry?.label || `サマリー${index + 1}`, data: resolved })
    }
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box
        sx={{
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: theme => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.200'),
          cursor: 'zoom-in',
        }}
        onClick={handlePreview}
      >
        <img
          src={representativeSources.primary}
          alt={lot.representativeImage ? `${lot.lotId} representative` : 'placeholder'}
          onError={e => handleImageError(e, representativeSources.fallback)}
          draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>

      {summaryBlocks.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {summaryBlocks.map((block, index) => (
            <ShotsSummaryBlock key={block.label || index} title={block.label} summary={block.data} />
          ))}
        </Box>
      )}

      <Divider flexItem />

      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          判定要素
        </Typography>
        {shouldSummarize && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: showDetailedChips ? 1.5 : 0 }}>
            {chipSummary.map(summary => (
              <Chip
                key={summary.normalized}
                label={`${summary.displayLabel}: ${summary.count}件`}
                size="small"
                color={getChipColor(summary.displayLabel)}
                variant={summary.normalized === 'OK' ? 'outlined' : 'filled'}
              />
            ))}
          </Box>
        )}
        {showDetailedChips && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {chips.map((item, index) => {
              const normalizedStatus = (item?.status || '').toString().trim().toUpperCase()
              const label = resolveDisplayName(item, index)
              const statusLabel = item?.status || 'UNKNOWN'

              return (
                <Chip
                  key={`${label}-${index}`}
                  label={`${label}: ${statusLabel}`}
                  size="small"
                  color={getChipColor(statusLabel)}
                  variant={normalizedStatus === 'OK' || normalizedStatus === 'PASS' ? 'outlined' : 'filled'}
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
            sx={{ mt: 1.5, px: 0 }}
          >
            {showAllChips ? '概要に戻す' : `詳細を見る (${chips.length}項目)`}
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default LotInfoSection
