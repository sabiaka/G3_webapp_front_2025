import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

const LotInfoSection = ({
  lot,
  representativeSources,
  handleImageError,
  setLightbox,
  getChipColor,
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

  const hasCameraDetails = (lot.cameras || []).some(c => c.status !== 'OK' && c.details && c.details !== '-')

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
        {hasCameraDetails && (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {(lot.cameras || [])
              .filter(c => c.status !== 'OK' && c.details && c.details !== '-')
              .map((camera, index) => (
                <Typography key={index} variant="body2" color="error.main">
                  {camera.name}: {camera.details}
                </Typography>
              ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default LotInfoSection
