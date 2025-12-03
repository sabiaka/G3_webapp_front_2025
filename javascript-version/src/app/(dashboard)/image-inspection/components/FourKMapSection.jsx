import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

const FourKMapSection = ({
  hasGrid,
  gridStructure,
  buildShotSources,
  getShotStatusColor,
  handleImageError,
  setLightbox,
}) => {
  const handlePreview = (sources, alt) => {
    if (!setLightbox) return
    setLightbox({
      open: true,
      src: sources.primary,
      fallback: sources.fallback,
      alt,
    })
  }

  return (
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
                  <Box key={cell.key} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {cell.col.label}
                    </Typography>
                  </Box>
                )
              }

              if (cell.type === 'rowHeader') {
                return (
                  <Box key={cell.key} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                    onClick={() => handlePreview(sources, shot.image_path || sequence.label)}
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
  )
}

export default FourKMapSection
