// モーダル内 撮影マップセクション（4K / FHD 共用）

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import ZoomInIcon from '@mui/icons-material/ZoomIn'

const SQUARE_ASPECT_RATIO = '1 / 1'
const STATUS_PRIORITY = ['FAIL', 'MISSING', 'PASS']

const pickDisplayShot = shots => {
  if (!Array.isArray(shots) || shots.length === 0) return null
  const prioritized = shots
    .map(shot => {
      const status = (shot?.status || '').toString().toUpperCase()
      const priorityIndex = STATUS_PRIORITY.indexOf(status)
      return {
        shot,
        priority: priorityIndex >= 0 ? priorityIndex : STATUS_PRIORITY.length,
      }
    })
    .sort((a, b) => a.priority - b.priority)

  return prioritized[0]?.shot || shots[0]
}

const FourKMapSection = ({
  title = '4K 撮影マップ',
  subtitle,
  status = 'success',
  loadingMessage = '詳細データを取得中です…',
  errorMessage = 'データの取得に失敗しました。',
  emptyMessage = '該当するデータがありません。',
  placeholderLabel = '未取得',
  gridStructure,
  buildShotSources,
  getShotStatusColor,
  handleImageError,
  setLightbox,
  onSelectSequence,
  selectedSequenceLabel,
  onBack,
}) => {
  const canPreview = Boolean(setLightbox)

  const handlePreview = (sources, alt) => {
    if (!setLightbox) return
    setLightbox({
      open: true,
      src: sources.primary,
      fallback: sources.fallback,
      alt,
    })
  }

  const columnCount = Array.isArray(gridStructure?.cols) ? gridStructure.cols.length : 0
  const cells = Array.isArray(gridStructure?.cells) ? gridStructure.cells : []
  const hasEntries = Boolean(gridStructure?.hasEntries)

  const renderContent = () => {
    if (status === 'error') {
      return <Alert severity="error">{errorMessage}</Alert>
    }

    const isLoading = status === 'loading' || status === 'idle'
    if (isLoading) {
      return (
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            color: 'text.secondary',
          }}
        >
          <CircularProgress size={24} thickness={5} />
          <Typography variant="body2" color="text.secondary">
            {loadingMessage}
          </Typography>
        </Box>
      )
    }

    if (!cells.length || columnCount === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      )
    }

    return (
      <Box sx={{ overflowX: 'auto', flexGrow: 1 }}>
        {!hasEntries && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {emptyMessage}
          </Typography>
        )}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `80px repeat(${columnCount}, minmax(160px, 1fr))`,
            gap: 2,
            alignItems: 'stretch',
            minWidth: `${80 + columnCount * 180}px`,
          }}
        >
          {cells.map(cell => {
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
                    position: 'relative',
                    width: '100%',
                    aspectRatio: SQUARE_ASPECT_RATIO,
                    cursor: onSelectSequence ? 'not-allowed' : 'default',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      border: theme => `1px dashed ${theme.palette.divider}`,
                      borderRadius: 2,
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: theme => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {placeholderLabel}
                    </Typography>
                  </Box>
                </Box>
              )
            }

            const displayShot = pickDisplayShot(entry.shots)
            const sequence = entry.sequence
            const isActive = Boolean(selectedSequenceLabel && sequence?.label === selectedSequenceLabel)
            const handleCellClick = () => {
              if (!onSelectSequence) return
              onSelectSequence(entry)
            }

            if (!displayShot) {
              return (
                <Box
                  key={cell.key}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: SQUARE_ASPECT_RATIO,
                    cursor: onSelectSequence ? 'pointer' : 'default',
                  }}
                  onClick={handleCellClick}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      border: theme => `1px dashed ${theme.palette.divider}`,
                      borderRadius: 2,
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: theme => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {placeholderLabel}
                    </Typography>
                  </Box>
                </Box>
              )
            }

            const sources = buildShotSources(displayShot)
            const statusColor = getShotStatusColor(displayShot.status)
            const metaParts = []
            if (displayShot.camera_id) metaParts.push(`CAM: ${displayShot.camera_id}`)
            if (displayShot.shot_seq != null) metaParts.push(`${displayShot.shot_seq}枚目`)
            if (Array.isArray(entry.shots) && entry.shots.length > 1) metaParts.push(`全${entry.shots.length}枚`)
            const metaLine = metaParts.join(' / ')
            const altText = displayShot.image_path || sequence.label
            const chipLabel = Array.isArray(entry.shots) && entry.shots.length > 1
              ? `${displayShot.status || '-'} / ${entry.shots.length}枚`
              : displayShot.status || '-'
            const statusesSummary = Array.isArray(entry.shots)
              ? entry.shots.map(s => s?.status || '-').join(', ')
              : ''

            const chipComponent = (
              <Chip size="small" label={chipLabel} color={statusColor} variant="outlined" />
            )

            const shouldPreviewOnImageClick = !onSelectSequence && canPreview

            return (
              <Box
                key={cell.key}
                sx={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: SQUARE_ASPECT_RATIO,
                  cursor: onSelectSequence ? 'pointer' : 'default',
                }}
                onClick={handleCellClick}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    border: theme => `1px solid ${isActive ? theme.palette.primary.main : theme.palette.divider}`,
                    borderWidth: isActive ? 2 : 1,
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    bgcolor: theme => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50'),
                    transition: theme => theme.transitions.create(['border-color', 'box-shadow', 'transform'], {
                      duration: theme.transitions.duration.shortest,
                    }),
                    '&:hover': onSelectSequence
                      ? {
                          borderColor: theme => theme.palette.primary.main,
                          boxShadow: theme => theme.shadows[2],
                          transform: 'translateY(-1px)',
                        }
                      : undefined,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {sequence.label}
                    </Typography>
                    {Array.isArray(entry.shots) && entry.shots.length > 1 ? (
                      <Tooltip title={`内訳: ${statusesSummary}`} arrow>
                        <span>{chipComponent}</span>
                      </Tooltip>
                    ) : (
                      chipComponent
                    )}
                  </Box>
                  <Tooltip title={displayShot.image_path || 'ファイルパス未登録'} enterDelay={300} arrow>
                    <Box
                      sx={{
                        position: 'relative',
                        flexGrow: 1,
                        minHeight: 0,
                        borderRadius: 1,
                        overflow: 'hidden',
                        bgcolor: theme => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200'),
                        cursor: shouldPreviewOnImageClick ? 'zoom-in' : onSelectSequence ? 'pointer' : 'default',
                      }}
                      onClick={shouldPreviewOnImageClick ? (event => {
                        event.stopPropagation()
                        handlePreview(sources, altText)
                      }) : undefined}
                    >
                      <img
                        src={sources.primary}
                        alt={altText}
                        onError={e => handleImageError(e, sources.fallback)}
                        draggable={false}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                        }}
                      />
                      {canPreview && (
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.7)'),
                            '&:hover': {
                              bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)'),
                            },
                          }}
                          onClick={event => {
                            event.stopPropagation()
                            handlePreview(sources, altText)
                          }}
                        >
                          <ZoomInIcon fontSize="inherit" />
                        </IconButton>
                      )}
                    </Box>
                  </Tooltip>
                  {displayShot.details && (
                    <Typography variant="caption" color="error.main">
                      {displayShot.details}
                    </Typography>
                  )}
                  {metaLine && (
                    <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                      {metaLine}
                    </Typography>
                  )}
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {onBack && (
          <Button size="small" color="primary" onClick={onBack} variant="outlined">
            4Kマップに戻る
          </Button>
        )}
      </Box>
      {renderContent()}
    </Box>
  )
}

export default FourKMapSection
