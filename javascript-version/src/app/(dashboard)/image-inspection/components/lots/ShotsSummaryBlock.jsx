import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'

import { alpha } from '@mui/material/styles'

import SurfaceBox from '@/components/surface/SurfaceBox'

const clampPercent = value => {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return 0
  if (num < 0) return 0
  if (num > 100) return 100
  return Math.round(num)
}

const ShotsSummaryBlock = ({ title, summary }) => {
  if (!summary) return null

  const total = Number.isFinite(summary.total) ? summary.total : 0
  const okCount = Number.isFinite(summary.okCount) ? summary.okCount : 0
  const ngCount = Number.isFinite(summary.ngCount) ? summary.ngCount : Math.max(total - okCount, 0)
  const okRate = clampPercent(summary.okRate)
  const ngRate = clampPercent(summary.ngRate ?? 100 - okRate)

  return (
    <Box sx={{ '& + &': { mt: 3 } }}>
      {title ? (
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
      ) : null}
      <Grid container spacing={1.5}>
        <Grid item xs={4}>
          <SurfaceBox variant="soft" sx={{ p: 1.5, borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              総枚数
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {total}
            </Typography>
          </SurfaceBox>
        </Grid>
        <Grid item xs={4}>
          <SurfaceBox variant="soft" sx={{ p: 1.5, borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              良品画像
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="success.main">
              {okCount}
            </Typography>
          </SurfaceBox>
        </Grid>
        <Grid item xs={4}>
          <SurfaceBox variant="soft" sx={{ p: 1.5, borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              不良画像
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="error.main">
              {ngCount}
            </Typography>
          </SurfaceBox>
        </Grid>
      </Grid>
      <Box sx={{ mt: 2 }}>
        <LinearProgress
          variant="determinate"
          value={okRate}
          sx={theme => ({
            height: 8,
            borderRadius: 4,
            bgcolor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.5 : 0.2),
            '& .MuiLinearProgress-bar': {
              backgroundColor: theme.palette.success.main,
            },
          })}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" color="success.main">
            良率 {okRate}%
          </Typography>
          <Typography variant="caption" color="error.main">
            不良率 {ngRate}%
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default ShotsSummaryBlock
