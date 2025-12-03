import { useCallback, useEffect, useMemo } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import { getFallbackImageBase, toAfterTestUrl, toBeforeTestUrl, toImageUrl } from '../utils/imageUrl'

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
                onClick={() => {
                  if (setLightbox) {
                    setLightbox({
                      open: true,
                      src: representativeSources.primary,
                      fallback: representativeSources.fallback,
                      alt: lot.representativeImage ? `${lot.lotId} representative` : 'placeholder',
                    })
                  }
                }}
              >
                <img
                  src={representativeSources.primary}
                  alt={lot.representativeImage ? `${lot.lotId} representative` : 'placeholder'}
                  onError={e => handleImageError(e, representativeSources.fallback)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>

              <Divider flexItem />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  判定要素
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(lot.cameras || []).map((camera, index) => (
                    <Chip
                      key={`${camera.name}-${index}`}
                      label={`${camera.name}: ${camera.status}`}
                      size="small"
                      color={getChipColor(camera.status)}
                      variant={camera.status === 'OK' ? 'outlined' : 'filled'}
                    />
                  ))}
                </Box>
                {(lot.cameras || []).some(c => c.status !== 'OK' && c.details && c.details !== '-') && (
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {(lot.cameras || []).filter(c => c.status !== 'OK' && c.details && c.details !== '-').map((c, idx) => (
                      <Typography key={idx} variant="body2" color="error.main">
                        {c.name}: {c.details}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={7}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                4K 撮影マップ
              </Typography>
              {!hasGrid ? (
                <Typography variant="body2" color="text.secondary">
                  詳細データを取得中です…
                </Typography>
              ) : (
                <Box sx={{ overflowX: 'auto', flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: `80px repeat(${gridStructure.cols.length}, minmax(160px, 1fr))`,
                      gap: 2,
                      alignItems: 'stretch',
                      minWidth: `${80 + gridStructure.cols.length * 180}px`,
                    }}
                  >
                    {gridStructure.cells.map(cell => {
                      if (cell.type === 'corner') {
                        return <Box key={cell.key} />
                      }
                      if (cell.type === 'colHeader') {
                        return (
                          <Box
                            key={cell.key}
                            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                          >
                            <Typography variant="subtitle2" fontWeight="bold">
                              {cell.col.label}
                            </Typography>
                          </Box>
                        )
                      }
                      if (cell.type === 'rowHeader') {
                        return (
                          <Box
                            key={cell.key}
                            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                          >
                            <Typography variant="subtitle2" fontWeight="bold">
                              {cell.row.label}
                            </Typography>
                          </Box>
                        )
                      }

                      const entry = cell.entry
                      if (!entry) {
                        return (
                          <Box
                            key={cell.key}
                            sx={{
                              border: theme => `1px dashed ${theme.palette.divider}`,
                              borderRadius: 2,
                              p: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: theme => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              未取得
                            </Typography>
                          </Box>
                        )
                      }

                      const { shot, sequence } = entry
                      const sources = buildShotSources(shot)
                      const statusColor = getShotStatusColor(shot.status)
                      const metaParts = []
                      if (shot.camera_id) metaParts.push(`CAM: ${shot.camera_id}`)
                      if (shot.shot_seq != null) metaParts.push(`${shot.shot_seq}枚目`)
                      const metaLine = metaParts.join(' / ')

                      return (
                        <Box
                          key={cell.key}
                          sx={{
                            border: theme => `1px solid ${theme.palette.divider}`,
                            borderRadius: 2,
                            p: 1.5,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            bgcolor: theme => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50'),
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight="bold">
                              {sequence.label}
                            </Typography>
                            <Chip size="small" label={shot.status || '-'} color={statusColor} variant="outlined" />
                          </Box>
                          <Box
                            sx={{
                              width: '100%',
                              aspectRatio: '4/3',
                              borderRadius: 1,
                              overflow: 'hidden',
                              bgcolor: theme => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200'),
                              cursor: 'zoom-in',
                            }}
                            onClick={() => {
                              if (setLightbox) {
                                setLightbox({
                                  open: true,
                                  src: sources.primary,
                                  fallback: sources.fallback,
                                  alt: shot.image_path || sequence.label,
                                })
                              }
                            }}
                          >
                            <img
                              src={sources.primary}
                              alt={shot.image_path || sequence.label}
                              onError={e => handleImageError(e, sources.fallback)}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </Box>
                          {shot.details && (
                            <Typography variant="caption" color="error.main">
                              {shot.details}
                            </Typography>
                          )}
                          {metaLine && (
                            <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                              {metaLine}
                            </Typography>
                          )}
                          {shot.image_path && (
                            <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                              {shot.image_path}
                            </Typography>
                          )}
                        </Box>
                      )
                    })}
                  </Box>
                </Box>
              )}
            </Box>
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
