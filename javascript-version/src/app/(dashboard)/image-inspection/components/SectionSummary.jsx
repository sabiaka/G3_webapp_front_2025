import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

const SectionSummary = ({ latestLot, lotStatus }) => {
  if (!latestLot) return <Typography color="text.secondary">本日のロットデータはありません。</Typography>
  const failedCams = latestLot.cameras.filter(c => c.status !== 'OK')
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <Box sx={{ flexGrow: 1, minWidth: 220 }}>
        <Typography variant="body2" color="text.secondary">{latestLot.time}</Typography>
        <Typography variant="h5" fontWeight="bold">{latestLot.lotId}</Typography>
        {lotStatus === 'FAIL' && failedCams.length > 0 && (
          <Typography variant="body2" color="error.main" sx={{ mt: 0.5 }}>
            不良: {failedCams.map(c => `${c.name}${c.details && c.details !== '-' ? `（${c.details}）` : ''}`).join('、')}
          </Typography>
        )}
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="h4" fontWeight="bold" color={lotStatus === 'PASS' ? 'success.main' : 'error.main'}>
          {lotStatus}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {latestLot.cameras.map((c, i) => (
            <Chip key={i} label={`${c.name}: ${c.status}`} size="small" color={c.status === 'OK' ? 'success' : 'error'} />
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default SectionSummary
