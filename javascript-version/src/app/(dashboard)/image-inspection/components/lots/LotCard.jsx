// ロットカード表示コンポーネント

import { useCallback, useMemo } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

import { getFallbackImageBase, toImageUrl } from '../../utils/imageUrl'

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

const LotCard = ({
  lot,
  lotStatus,
  onOpen,
  isActive = false,
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

  const chipColor = lotStatus === 'PASS' ? 'success' : lotStatus === 'FAIL' ? 'error' : 'default'

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderColor: isActive ? 'primary.main' : undefined,
        boxShadow: isActive ? theme => `0 0 0 1px ${theme.palette.primary.main}` : undefined,
      }}
    >
      <CardActionArea
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
        onClick={onOpen}
      >
        <Box
          sx={{
            position: 'relative',
            aspectRatio: '16/9',
            bgcolor: theme => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.200'),
            overflow: 'hidden',
          }}
        >
          <img
            src={representativeSources.primary}
            alt={lot.representativeImage ? `${lot.lotId} representative` : 'placeholder'}
            onError={e => handleImageError(e, representativeSources.fallback)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', userSelect: 'none' }}
            draggable={false}
          />
        </Box>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {lot.date} {lot.time}
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {lot.lotId}
              </Typography>
            </Box>
            <Chip label={lotStatus || '-'} color={chipColor} size="small" variant="filled" />
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
      </CardActionArea>
    </Card>
  )
}

export default LotCard
