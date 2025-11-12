"use client"

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'

export default function InspectionPanel({ overallStatus, tiles }) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
  <CardHeader title={<Typography variant='h4' fontWeight={700} sx={{ fontSize: { xs: '2.2rem', md: '2.4rem' } }}>画像検査</Typography>} />
      <CardContent sx={{ pt: 0, display: 'flex', flexDirection: 'column', gap: 3, flexGrow: 1, minHeight: 0 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant='h3' fontWeight={900} color={overallStatus === 'PASS' ? 'success.main' : 'error.main'} sx={{ fontSize: { xs: '2.75rem', md: '3.25rem' } }}>
            {overallStatus}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {tiles.map(t => (
            <Grid item xs={12} sm={6} key={t.index}>
              <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', bgcolor: 'black', aspectRatio: '16 / 9', backgroundImage: t.imageUrl ? `url(${t.imageUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <Typography sx={{ position: 'absolute', top: 12, left: 16 }} variant='subtitle1' color='grey.300' fontWeight={600}>
                  {t.cameraId}
                </Typography>
                <Chip size='medium' color={t.status === 'PASS' ? 'success' : 'error'} label={t.status} sx={{ position: 'absolute', top: 10, right: 16, fontWeight: 700 }} />
                {t.status === 'FAIL' && t.failReason ? (
                  <Chip size='medium' color='error' variant='filled' label={t.failReason} sx={{ position: 'absolute', bottom: 12, right: 16, maxWidth: '75%', overflow: 'hidden', textOverflow: 'ellipsis' }} />
                ) : null}
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}
