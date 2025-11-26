import { useCallback, useMemo } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

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

const getShotStatusColor = status => {
  const normalized = (status || '').toString().toUpperCase()
  if (normalized === 'PASS') return 'success'
  if (normalized === 'FAIL') return 'error'
  if (normalized === 'MISSING') return 'warning'
  return 'default'
}

const LotCard = ({
  lot,
  lotStatus,
  isExpanded,
  onToggle,
  shotsByCamera,
  setLightbox,
}) => {

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
    () => buildImageSources(lot.representativeImage),
    [buildImageSources, lot.representativeImage],
  )

  const shotsEntries = useMemo(() => Object.entries(shotsByCamera || {}), [shotsByCamera])

  const showDetailsButtonLabel = isExpanded ? '詳細を閉じる' : '詳細を見る'

  const chipColor = lotStatus === 'PASS' ? 'success' : lotStatus === 'FAIL' ? 'error' : 'default'

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          position: 'relative',
          aspectRatio: '16/9',
          bgcolor: theme => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.200'),
          overflow: 'hidden',
          cursor: lot.representativeImage ? 'pointer' : 'default',
        }}
        onClick={() => {
          if (!lot.representativeImage) return
          setLightbox({
            open: true,
            src: representativeSources.primary,
            fallback: representativeSources.fallback,
            alt: `${lot.lotId} representative`,
          })
        }}
      >
        <img
          src={representativeSources.primary}
          alt={lot.representativeImage ? `${lot.lotId} representative` : 'placeholder'}
          onError={e => handleImageError(e, representativeSources.fallback)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {lot.date} {lot.time}
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {lot.lotId}
            </Typography>
          </Box>
          <Chip label={lotStatus} color={chipColor} size="small" variant="filled" />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {(lot.cameras || []).filter(c => c.status !== 'OK' && c.details && c.details !== '-').map((c, idx) => (
                <Typography key={idx} variant="caption" color="error.main">
                  {c.name}: {c.details}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', px: 3, pb: isExpanded ? 0 : 2 }}>
        <Button
          size="small"
          onClick={onToggle}
          endIcon={<ExpandMoreIcon sx={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />}
        >
          {showDetailsButtonLabel}
        </Button>
      </CardActions>
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Box sx={{ px: 3, pb: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            撮影・検査履歴
          </Typography>
          {shotsEntries.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              詳細データがありません。
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>カメラ/シーケンス</TableCell>
                    <TableCell>結果</TableCell>
                    <TableCell>詳細</TableCell>
                    <TableCell align="right">画像</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shotsEntries.flatMap(([key, shots]) =>
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
                          <TableCell align="right" sx={{ width: 220 }}>
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
                                  width: 120,
                                  aspectRatio: '16/9',
                                  borderRadius: 1,
                                  overflow: 'hidden',
                                  bgcolor: theme => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.200'),
                                  cursor: 'pointer',
                                }}
                                onClick={() => {
                                  setLightbox({ open: true, src: sources.primary, fallback: sources.fallback, alt: shot.image_path || 'shot' })
                                }}
                              >
                                <img
                                  src={sources.primary}
                                  alt={shot.image_path || 'shot'}
                                  onError={e => handleImageError(e, sources.fallback)}
                                  style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 4 }}
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
            </TableContainer>
          )}
        </Box>
      </Collapse>
    </Card>
  )
}

export default LotCard
