import { useCallback, useMemo } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
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

const getChipColor = status => {
  if (status === 'OK') return 'success'
  if (status === 'NG') return 'error'
  return 'default'
}

const getLotStatusColor = status => {
  if (status === 'PASS') return 'success'
  if (status === 'FAIL') return 'error'
  return 'default'
}

const getShotStatusColor = status => {
  const normalized = (status || '').toString().toUpperCase()
  if (normalized === 'PASS') return 'success'
  if (normalized === 'FAIL') return 'error'
  if (normalized === 'MISSING') return 'warning'
  return 'default'
}

const LotDetailModal = ({ open, lot, lotStatus, shotsByCamera, onClose, setLightbox }) => {
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
    let primary = ''
    if (status === 'MISSING') primary = toBeforeTestUrl(normalized)
    if (!primary && (status === 'PASS' || status === 'FAIL')) primary = toAfterTestUrl(normalized)
    if (!primary) primary = toImageUrl(normalized)
    const fallback = fallbackImageBase ? toImageUrl(normalized, { base: fallbackImageBase }) : ''
    return {
      primary: primary || FALLBACK_IMG,
      fallback: fallback && fallback !== primary ? fallback : '',
    }
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

  const shotEntries = useMemo(
    () => Object.entries(shotsByCamera || {}).map(([key, shots]) => [key, Array.isArray(shots) ? shots : []]),
    [shotsByCamera],
  )

  if (!lot) return null

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
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
      <DialogContent dividers sx={{ '& > * + *': { mt: 4 } }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
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
          </Grid>
          <Grid item xs={12} md={6}>
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
          </Grid>
        </Grid>

        <Divider />

        <Box>
          <Typography variant="h6" gutterBottom>
            撮影・検査履歴
          </Typography>
          {shotEntries.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              詳細データを取得中です…
            </Typography>
          ) : (
            <Table size="small" aria-label="lot shots table">
              <TableHead>
                <TableRow>
                  <TableCell>カメラ/シーケンス</TableCell>
                  <TableCell>結果</TableCell>
                  <TableCell>詳細</TableCell>
                  <TableCell align="right">画像</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shotEntries.flatMap(([key, shots]) =>
                  shots.map((shot, idx) => {
                    const sources = buildShotSources(shot)
                    const statusColor = getShotStatusColor(shot.status)

                    return (
                      <TableRow key={`${key}-${idx}`}>
                        <TableCell sx={{ fontWeight: 500 }}>{key}</TableCell>
                        <TableCell>
                          <Chip label={shot.status || '-'} size="small" color={statusColor} />
                        </TableCell>
                        <TableCell>{shot.details || '-'}</TableCell>
                        <TableCell align="right" sx={{ width: 240 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ maxWidth: '100%', wordBreak: 'break-all', textAlign: 'right' }}
                            >
                              {shot.image_path || '-'}
                            </Typography>
                            <Box
                              sx={{
                                width: 140,
                                aspectRatio: '16/9',
                                borderRadius: 1,
                                overflow: 'hidden',
                                bgcolor: theme => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.200'),
                                cursor: 'zoom-in',
                              }}
                              onClick={() => {
                                if (setLightbox) {
                                  setLightbox({ open: true, src: sources.primary, fallback: sources.fallback, alt: shot.image_path || 'shot' })
                                }
                              }}
                            >
                              <img
                                src={sources.primary}
                                alt={shot.image_path || 'shot'}
                                onError={e => handleImageError(e, sources.fallback)}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default LotDetailModal
