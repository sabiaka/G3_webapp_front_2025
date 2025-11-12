"use client"

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import useSignageData from '../components/useSignageData'
import MachineStatusPanel from '../components/MachineStatusPanel'
import InspectionPanel from '../components/InspectionPanel'
import DebugControls from '../components/DebugControls'
import AlertOverlay from '../components/AlertOverlay'

const Page = () => {
  const data = useSignageData()

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', fontSize: '125%' }}>
      {/* Header */}
      <Box sx={{ px: 4, py: 3 }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Box>
            <Typography variant='h3' fontWeight={900} letterSpacing={2} sx={{ fontSize: { xs: '2.75rem', md: '3.25rem' } }}>工場ダッシュボード</Typography>
            <DebugControls onError={data.onDebugError} onWarning={data.onDebugWarning} onNormal={data.onDebugNormal} />
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant='h3' fontWeight={800} sx={{ fontSize: { xs: '2.75rem', md: '3.25rem' } }}>{data.clock.time}</Typography>
            <Typography variant='h5' color='text.secondary' sx={{ fontSize: { xs: '1.75rem', md: '2rem' } }}>{data.clock.date}</Typography>
          </Box>
        </Stack>
      </Box>

      {/* Main */}
      <Box sx={{ px: 4, pb: 4, flexGrow: 1, minHeight: 0 }}>
        <Grid container spacing={4} sx={{ height: '100%' }}>
          <Grid item xs={12} xl={6} sx={{ height: { xs: 'auto', xl: '100%' } }}>
            <MachineStatusPanel
              machineName={data.machineName}
              machineBadge={data.machineBadge}
              todayUptimeSec={data.todayUptimeSec}
              todayProdCount={data.todayProdCount}
              lastInspectionDate={data.lastInspectionDate}
              nextInspectionDate={data.nextInspectionDate}
              logs={data.logs}
              formatNumber={data.formatNumber}
            />
          </Grid>
          <Grid item xs={12} xl={6} sx={{ height: { xs: 'auto', xl: '100%' } }}>
            <Stack spacing={4} sx={{ height: '100%' }}>
              <InspectionPanel overallStatus={data.overallStatus} tiles={data.tiles} />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant='body1' color='text.secondary' sx={{ fontSize: '1.1rem' }}>rot_id</Typography>
                    <Typography variant='h4' fontWeight={700} sx={{ fontSize: { xs: '2.2rem', md: '2.5rem' } }}>{data.rotId || '---'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant='body1' color='text.secondary' sx={{ fontSize: '1.1rem' }}>検査時間</Typography>
                    <Typography variant='h4' fontWeight={700} sx={{ fontSize: { xs: '2.2rem', md: '2.5rem' } }}>{data.inspectionTime}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <AlertOverlay alert={data.alert} />
    </Box>
  )
}

export default Page
