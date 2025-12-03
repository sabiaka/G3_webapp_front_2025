// A層ロット詳細モーダル

import { useCallback, useEffect, useMemo } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import { getFallbackImageBase, toAfterTestUrl, toBeforeTestUrl, toImageUrl } from '../../utils/imageUrl'
import FourKMapSection from './FourKMapSection'
import LotInfoSection from '../lots/LotInfoSection'

const fallbackImageBase = getFallbackImageBase()
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const FALLBACK_IMG = `${basePath}/images/pages/CameraNotFound.png`

const normalizeRelativePath = path => {
  if (!path) return null
  const trimmed = String(path).trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  const cleaned = trimmed.replace(/\/{2,}/g, '/')
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`
}

const getLotStatusColor = status => {
  if (status === 'PASS') return 'success'
  if (status === 'FAIL') return 'error'
  return 'default'
}

const getChipColor = status => {
  if (status === 'OK') return 'success'
  if (status === 'NG') return 'error'
  return 'default'
}

const getShotStatusColor = status => {
  const normalized = (status || '').toString().toUpperCase()
  if (normalized === 'PASS') return 'success'
  if (normalized === 'FAIL') return 'error'
  if (normalized === 'MISSING') return 'warning'
  return 'default'
}

const toRowIndex = letters => {
  return letters.split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0) - 1
}

const parseFourKSequence = value => {
  if (!value) return null
  const raw = String(value).trim().toUpperCase()
  if (!raw) return null
  const match = raw.match(/^([A-Z]+)[-_]?(\d+)$/)
  if (!match) return null
  const [, rowLabel, colLabelRaw] = match
  const colNumber = parseInt(colLabelRaw, 10)
  if (!Number.isFinite(colNumber) || colNumber <= 0) return null
  const rowIndex = toRowIndex(rowLabel)
  if (rowIndex < 0) return null
  return {
    label: `${rowLabel}-${colNumber}`,
    rowLabel,
    colLabel: String(colNumber),
    rowIndex,
    colIndex: colNumber - 1,
  }
}

const buildGridStructure = shots => {
  const entries = (shots || [])
    .map(shot => {
      const seqValue = shot?.['c4k_seq'] ?? shot?.four_k_seq ?? shot?.seq
      const parsed = parseFourKSequence(seqValue)
      if (!parsed) return null
      return { shot, sequence: parsed }
    })
    .filter(Boolean)

  if (entries.length === 0) {
    return { rows: [], cols: [], cells: [] }
  }

  const rowMap = new Map()
  const colMap = new Map()
  const cellMap = new Map()

  entries.forEach(({ sequence, shot }) => {
    if (!rowMap.has(sequence.rowLabel)) {
      rowMap.set(sequence.rowLabel, { label: sequence.rowLabel, index: sequence.rowIndex })
    }
    if (!colMap.has(sequence.colLabel)) {
      colMap.set(sequence.colLabel, { label: sequence.colLabel, index: sequence.colIndex })
    }
    cellMap.set(sequence.label, { shot, sequence })
  })

  const rows = Array.from(rowMap.values()).sort((a, b) => a.index - b.index)
  const cols = Array.from(colMap.values()).sort((a, b) => a.index - b.index)

  const cells = []
  cells.push({ type: 'corner', key: 'corner' })
  cols.forEach(col => {
    cells.push({ type: 'colHeader', key: `col-${col.label}`, col })
  })
  rows.forEach(row => {
    cells.push({ type: 'rowHeader', key: `row-${row.label}`, row })
    cols.forEach(col => {
      const label = `${row.label}-${col.label}`
      const entry = cellMap.get(label) || null
      cells.push({ type: 'cell', key: `cell-${label}`, row, col, entry })
    })
  })

  return { rows, cols, cells }
}

const ALayerLotDetailModal = ({ open, lot, lotStatus, shots4k, onClose, setLightbox }) => {
  const buildImageSources = useCallback((path) => {
    const normalized = normalizeRelativePath(path)
    if (!normalized) return { primary: FALLBACK_IMG, fallback: '' }
    const primary = toImageUrl(normalized)
    const fallback = fallbackImageBase ? toImageUrl(normalized, { base: fallbackImageBase }) : ''
    return {
      primary: primary || FALLBACK_IMG,
      fallback: fallback && fallback !== primary ? fallback : '',
    }
  }, [])

  const buildShotSources = useCallback((shot) => {
    if (!shot) return { primary: FALLBACK_IMG, fallback: '' }
    const normalized = normalizeRelativePath(shot.image_path)
    if (!normalized) return { primary: FALLBACK_IMG, fallback: '' }
    const status = (shot.status || '').toString().toUpperCase()
    const hasFallbackBase = Boolean(fallbackImageBase)

    const buildPair = builder => {
      const primaryCandidate = builder(normalized)
      const fallbackCandidate = hasFallbackBase ? builder(normalized, { base: fallbackImageBase }) : ''
      return { primary: primaryCandidate, fallback: fallbackCandidate }
    }

    const ensureUrl = pair => {
      if (pair.primary) return pair
      return buildPair((path, options) => toImageUrl(path, options))
    }

    let pair
    if (status === 'MISSING') {
      pair = ensureUrl(buildPair((path, options) => toBeforeTestUrl(path, options)))
    } else if (status === 'PASS' || status === 'FAIL') {
      pair = ensureUrl(buildPair((path, options) => toAfterTestUrl(path, options)))
    } else {
      pair = ensureUrl(buildPair((path, options) => toImageUrl(path, options)))
    }

    const primary = pair.primary || FALLBACK_IMG
    const fallback = pair.fallback && pair.fallback !== primary ? pair.fallback : ''

    return { primary, fallback }
  }, [])

  const handleImageError = (event, fallbackSrc) => {
    const target = event.currentTarget
    if (fallbackSrc && !target.dataset.fallbackTried) {
      target.dataset.fallbackTried = 'true'
      target.src = fallbackSrc
    } else if (target.src !== FALLBACK_IMG) {
      target.src = FALLBACK_IMG
    }
  }

  const representativeSources = useMemo(
    () => buildImageSources(lot?.representativeImage),
    [buildImageSources, lot?.representativeImage],
  )

  const gridStructure = useMemo(() => buildGridStructure(shots4k), [shots4k])
  const hasGrid = gridStructure.rows.length > 0 && gridStructure.cols.length > 0

  useEffect(() => {
    if (!open) return

    if (shots4k == null) {
      console.error('[ALayerLotDetailModal] shots4k が null または undefined です', {
        lotId: lot?.lotId,
        shots4k,
      })
      return
    }

    if (!Array.isArray(shots4k)) {
      console.error('[ALayerLotDetailModal] shots4k は配列ではありません', {
        lotId: lot?.lotId,
        type: typeof shots4k,
        shots4k,
      })
      return
    }

    if (shots4k.length === 0) {
      console.warn('[ALayerLotDetailModal] shots4k 配列が空です', {
        lotId: lot?.lotId,
      })
      return
    }

    if (!hasGrid) {
      const invalidShots = shots4k
        .map(shot => {
          const seqValue = shot?.['c4k_seq'] ?? shot?.four_k_seq ?? shot?.seq
          const parsed = parseFourKSequence(seqValue)
          if (parsed) return null
          return {
            seqValue,
            shot,
          }
        })
        .filter(Boolean)

      console.error('[ALayerLotDetailModal] 4K グリッド構造の構築に失敗しました', {
        lotId: lot?.lotId,
        shotsCount: shots4k.length,
        invalidShotCount: invalidShots.length,
        invalidShots,
      })
    }
  }, [open, shots4k, lot?.lotId, hasGrid])

  if (!lot) return null

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {lot.date} {lot.time}
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {lot.lotId}
            </Typography>
          </Box>
          <Chip label={lotStatus || '-'} color={getLotStatusColor(lotStatus)} size="small" variant="filled" />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <LotInfoSection
              lot={lot}
              representativeSources={representativeSources}
              handleImageError={handleImageError}
              setLightbox={setLightbox}
              getChipColor={getChipColor}
            />
          </Grid>
          <Grid item xs={12} md={7}>
            <FourKMapSection
              hasGrid={hasGrid}
              gridStructure={gridStructure}
              buildShotSources={buildShotSources}
              getShotStatusColor={getShotStatusColor}
              handleImageError={handleImageError}
              setLightbox={setLightbox}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ALayerLotDetailModal
