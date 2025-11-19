// 単一カメラの名称と稼働ステータスを表示するタイル
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

const CameraTile = ({ name, status = 'OK' }) => (
  <Box
    sx={{
      bgcolor: 'black',
      borderRadius: 2,
      aspectRatio: '16/9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 2,
    }}
  >
    <Typography color="grey.400" fontWeight={600}>
      {name}
    </Typography>
    <Chip
      label={status}
      size="small"
      color={status === 'OK' ? 'success' : 'error'}
      variant="filled"
    />
  </Box>
)

export default CameraTile
