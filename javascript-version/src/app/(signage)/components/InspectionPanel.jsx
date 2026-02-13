"use client"

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

export default function InspectionPanel({ overallStatus, tiles }) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* ヘッダー */}
      <CardHeader 
        sx={{ py: 2, px: 3 }}
        title={
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant='h4' fontWeight={700} sx={{ fontSize: { xs: '2.2rem', md: '2.4rem' } }}>
              画像検査
            </Typography>
            
            {/* 判定結果(PASS/FAIL)の表示 */}
            <Typography 
              variant='h3' 
              fontWeight={900} 
              color={overallStatus === 'PASS' ? 'success.main' : 'error.main'} 
              // ▼▼▼ ここに mr: 4 (右余白) を追加して左にずらしています ▼▼▼
              // 数字を大きくするともっと左に、小さくすると右寄りに戻ります
              sx={{ fontSize: { xs: '2.5rem', md: '3rem' }, lineHeight: 1, mr: 4 }}
            >
              {overallStatus}
            </Typography>
          </Stack>
        } 
      />
      
      <CardContent sx={{ 
        pt: 0, 
        pb: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        overflow: 'hidden' 
      }}>
        
        <Grid container spacing={1} sx={{ flexGrow: 1, minHeight: 0 }}>
          {tiles.map((t, i) => (
            <Grid item xs={6} key={i} sx={{ height: '50%' }}>
              <Box sx={{ 
                position: 'relative', 
                borderRadius: 2, 
                overflow: 'hidden', 
                bgcolor: 'black',
                width: '100%',
                height: '100%', 
                
                backgroundImage: t.imageUrl ? `url(${t.imageUrl})` : 'none', 
                backgroundSize: 'contain', 
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                border: '1px solid #333'
              }}>
                {/* カメラID */}
                <Typography sx={{ 
                  position: 'absolute', top: 6, left: 8, 
                  bgcolor: 'rgba(0,0,0,0.6)', px: 0.8, py: 0.2, borderRadius: 1,
                  fontSize: '0.9rem'
                }} variant='subtitle1' color='grey.300' fontWeight={600}>
                  {t.cameraId}
                </Typography>
                
                {/* 個別ステータス */}
                <Chip 
                  size='small' 
                  color={t.status === 'PASS' ? 'success' : 'error'} 
                  label={t.status} 
                  sx={{ position: 'absolute', top: 6, right: 8, fontWeight: 700 }} 
                />
                
                {/* 失敗理由 */}
                {t.status === 'FAIL' && t.failReason ? (
                  <Chip size='small' color='error' variant='filled' label={t.failReason} sx={{ position: 'absolute', bottom: 6, right: 8, maxWidth: '80%' }} />
                ) : null}
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}