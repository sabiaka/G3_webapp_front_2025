// 単一カメラの名称と稼働ステータスを表示するタイル

import { useCallback, useMemo } from 'react'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

import { getFallbackImageBase, toAfterTestUrl, toBeforeTestUrl, toImageUrl } from '../../utils/imageUrl'

const fallbackImageBase = getFallbackImageBase()
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const FALLBACK_IMG = `${basePath}/images/pages/CameraNotFound.png`

const normalizeRelativePath = path => {
  if (!path) return null
  const trimmed = String(path).trim()
  if (!trimmed) return null
  const sanitized = trimmed.replace(/\\/g, '/')
  if (/^https?:\/\//i.test(sanitized)) {
    const [protocol, rest] = sanitized.split('://')
    if (!rest) return sanitized
    const cleanedRest = rest.replace(/\/{3,}/g, '//')
    return `${protocol}://${cleanedRest}`
  }
  const withLeading = sanitized.startsWith('/') ? sanitized : `/${sanitized}`
  return withLeading.replace(/\/{3,}/g, '//')
}

const CameraTile = ({ name, status = 'OK', isSingle = false, imagePath }) => {
  const normalizedStatus = (status || '').toString().trim().toUpperCase()

  const chipColor = normalizedStatus === 'OK'
    ? 'success'
    : normalizedStatus === 'MISSING'
      ? 'warning'
      : 'error'

  const label = normalizedStatus || 'UNKNOWN'

  const buildImageSources = useCallback(() => {
    const normalizedPath = normalizeRelativePath(imagePath)
    if (!normalizedPath) {
      return { primary: FALLBACK_IMG, fallback: '' }
    }

    const hasFallbackBase = Boolean(fallbackImageBase)

    const buildPair = builder => {
      const primaryCandidate = builder(normalizedPath)
      const fallbackCandidate = hasFallbackBase ? builder(normalizedPath, { base: fallbackImageBase }) : ''
      return { primary: primaryCandidate, fallback: fallbackCandidate }
    }

    const ensureUrl = pair => {
      if (pair.primary) return pair
      const primaryCandidate = toImageUrl(normalizedPath)
      const fallbackCandidate = hasFallbackBase ? toImageUrl(normalizedPath, { base: fallbackImageBase }) : ''
      return { primary: primaryCandidate, fallback: fallbackCandidate }
    }

    const hasExplicitRoot = normalizedPath.includes('/imageDB/') || /^https?:\/\//i.test(normalizedPath)
    if (hasExplicitRoot) {
      const primaryCandidate = toImageUrl(normalizedPath)
      const fallbackCandidate = hasFallbackBase ? toImageUrl(normalizedPath, { base: fallbackImageBase }) : ''
      const primary = primaryCandidate || FALLBACK_IMG
      const fallback = fallbackCandidate && fallbackCandidate !== primary ? fallbackCandidate : ''
      return { primary, fallback }
    }

    let pair
    if (normalizedStatus === 'MISSING') {
      pair = ensureUrl(buildPair((path, options) => toBeforeTestUrl(path, options)))
    } else if (normalizedStatus === 'PASS' || normalizedStatus === 'OK' || normalizedStatus === 'FAIL' || normalizedStatus === 'NG') {
      pair = ensureUrl(buildPair((path, options) => toAfterTestUrl(path, options)))
    } else {
      pair = ensureUrl(buildPair((path, options) => toImageUrl(path, options)))
    }

    const primary = pair.primary || FALLBACK_IMG
    const fallback = pair.fallback && pair.fallback !== primary ? pair.fallback : ''
    return { primary, fallback }
  }, [imagePath, normalizedStatus])

  const imageSources = useMemo(() => buildImageSources(), [buildImageSources])

  const handleImageError = useCallback((event) => {
    const target = event.currentTarget
    if (imageSources.fallback && !target.dataset.fallbackTried) {
      target.dataset.fallbackTried = 'true'
      target.src = imageSources.fallback
    } else if (target.src !== FALLBACK_IMG) {
      target.src = FALLBACK_IMG
    }
  }, [imageSources.fallback])

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 2,
        aspectRatio: isSingle ? '21/9' : '16/9',
        overflow: 'hidden',
      }}
    >
      <img
        src={imageSources.primary}
        alt={imagePath ? `${name} latest capture` : 'placeholder'}
        onError={handleImageError}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          px: isSingle ? 4 : 2,
          py: isSingle ? 3 : 1.5,
          background: theme => `linear-gradient(to top, ${theme.palette.grey[900]}dd 0%, transparent 60%)`,
        }}
      >
        <Typography color="common.white" fontWeight={600} variant={isSingle ? 'h5' : 'body1'} sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
          {name}
        </Typography>
        <Chip
          label={label}
          size={isSingle ? 'medium' : 'small'}
          color={chipColor}
          variant="filled"
          sx={{ fontSize: isSingle ? '1rem' : '0.75rem', fontWeight: 600 }}
        />
      </Box>
    </Box>
  )
}

export default CameraTile
