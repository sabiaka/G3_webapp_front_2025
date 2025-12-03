// 単一カメラの名称と稼働ステータスを表示するタイル

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

const CameraTile = ({ name, status = 'OK', isSingle = false }) => {
  const normalizedStatus = (status || '').toString().trim().toUpperCase()

  const chipColor = normalizedStatus === 'OK'
    ? 'success'
    : normalizedStatus === 'MISSING'
      ? 'warning'
      : 'error'

  const label = normalizedStatus || 'UNKNOWN'

  return (
    <Box
      sx={{
        bgcolor: 'black',
        borderRadius: 2,
        aspectRatio: isSingle ? '21/9' : '16/9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: isSingle ? 4 : 2,
        py: isSingle ? 3 : 0,
      }}
    >
      <Typography color="grey.400" fontWeight={600} variant={isSingle ? 'h5' : 'body1'}>
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
  )
}

export default CameraTile
