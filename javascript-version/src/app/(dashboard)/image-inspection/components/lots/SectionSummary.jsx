// 最新ロットの結果と各カメラの判定をまとめて表示するサマリー行コンポーネント

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

const normalizeStatus = status => (status || '').toString().trim().toUpperCase()

const cameraChipColor = status => {
  const normalized = normalizeStatus(status)
  if (normalized === 'OK') return 'success'
  if (normalized === 'NG') return 'error'
  if (normalized === 'MISSING') return 'warning'
  return 'default'
}

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

const SectionSummary = ({ latestLot, lotStatus }) => {
  if (!latestLot) return <Typography color="text.secondary">本日のロットデータはありません。</Typography>

  const normalizedLotStatus = normalizeStatus(lotStatus)
  const lotStatusColor = normalizedLotStatus === 'PASS'
    ? 'success.main'
    : normalizedLotStatus === 'FAIL'
      ? 'error.main'
      : normalizedLotStatus === 'MISSING'
        ? 'warning.main'
        : 'text.secondary'

  const failedCams = (latestLot.cameras || []).filter(c => normalizeStatus(c.status) !== 'OK')

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,

        // 親は折り返さず左右を1行に固定。右側内部のチップのみ折り返す
        flexWrap: 'nowrap',
      }}
    >
      {/* 左側: 固定幅寄りにして過度に広がらない */}
      <Box sx={{ flex: '0 0 auto', minWidth: 220 }}>
        <Typography variant="body2" color="text.secondary">{latestLot.time}</Typography>
        <Typography variant="h5" fontWeight="bold">{latestLot.lotId}</Typography>
        {['FAIL', 'MISSING'].includes(normalizedLotStatus) && failedCams.length > 0 && (
          <Typography variant="body2" color={normalizedLotStatus === 'FAIL' ? 'error.main' : 'warning.main'} sx={{ mt: 0.5 }}>
            {normalizedLotStatus === 'FAIL' ? '不良' : '要確認'}: {failedCams.map((c, index) => {
              const label = resolveDisplayName(c, index)
              const detailText = c?.details && c.details !== '-' ? `（${c.details}）` : ''
              return `${label}${detailText}`
            }).join('、')}
          </Typography>
        )}
      </Box>
      {/* 右側: 余白を受け持ち、内部でチップのみ折り返し */}
      <Box sx={{ textAlign: 'right', flex: '1 1 0', minWidth: 0 }}>
        <Typography variant="h4" fontWeight="bold" color={lotStatusColor}>
          {normalizedLotStatus || '-'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end', flexWrap: 'wrap', maxWidth: '100%' }}>
          {(latestLot.cameras || []).map((c, i) => {
            const label = resolveDisplayName(c, i)
            const statusLabel = c?.status || 'UNKNOWN'
            return (
              <Chip
                key={`${label}-${i}`}
                label={`${label}: ${statusLabel}`}
                size="small"
                color={cameraChipColor(statusLabel)}
              />
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}

export default SectionSummary
