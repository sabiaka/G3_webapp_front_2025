// モーダル内ロット情報セクションコンポーネント

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

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

const LotInfoSection = ({
  lot,
  representativeSources,
  handleImageError,
  setLightbox,
  getChipColor,
  statusItems,
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

  const hasCameraDetails = chips.some(item => {
    const normalizedStatus = (item?.status || '').toString().trim().toUpperCase()
    return (
      normalizedStatus !== 'OK' &&
      normalizedStatus !== 'PASS' &&
      item?.details &&
      item.details !== '-'
    )
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

      <Divider flexItem />

      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          判定要素
        </Typography>
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
        {hasCameraDetails && (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {chips
              .filter(item => {
                const normalizedStatus = (item?.status || '').toString().trim().toUpperCase()
                return (
                  normalizedStatus !== 'OK' &&
                  normalizedStatus !== 'PASS' &&
                  item?.details &&
                  item.details !== '-'
                )
              })
              .map((item, index) => {
                const normalizedStatus = (item?.status || '').toString().trim().toUpperCase()
                const detailColor = normalizedStatus === 'MISSING' ? 'warning.main' : 'error.main'
                const label = resolveDisplayName(item, index)

                return (
                  <Typography key={index} variant="body2" color={detailColor}>
                    {label}: {item.details}
                  </Typography>
                )
              })}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default LotInfoSection
