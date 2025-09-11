'use client'

import { useState } from 'react'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'

const errorLogSample = [
  {
    type: 'エラー',
    code: 'E-102',
    title: 'トルク過負荷',
    desc: 'モーターの負荷が規定値を超えました。',
    date: '2025-07-15',
    time: '10:15:32',
    color: 'error',
  },
  {
    type: '警告',
    code: 'W-05',
    title: '潤滑油低下',
    desc: '潤滑油が規定レベルを下回っています。',
    date: '2025-07-15',
    time: '09:30:11',
    color: 'warning',
  },
  {
    type: '情報',
    code: 'I-001',
    title: '起動シーケンス完了',
    desc: '',
    date: '2025-07-15',
    time: '08:00:05',
    color: 'default',
  },
  {
    type: 'エラー',
    code: 'E-201',
    title: 'センサー接続エラー',
    desc: 'センサー#3との通信がタイムアウトしました。',
    date: '2025-07-14',
    time: '15:45:01',
    color: 'error',
  },
  {
    type: '警告',
    code: 'W-02',
    title: 'フィルター交換時期',
    desc: 'エアフィルターの交換を推奨します。',
    date: '2025-07-14',
    time: '11:20:45',
    color: 'warning',
  },
  {
    type: '情報',
    code: 'I-002',
    title: '生産完了 (Lot-24B)',
    desc: '',
    date: '2025-07-14',
    time: '17:30:00',
    color: 'default',
  },
]

const machineInfo = {
  name: '自動表層バネどめ機',
  image: '/images/projectpic/image.png',
  status: '正常に稼働中',
  statusColor: 'success',
  todayWorkTime: '8時間 25分',
  todayProduction: '1,520個',
  lastInspection: '2024/06/15',
  nextInspection: '2024/09/15',
}

const statusColorMap = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
  default: 'default',
}

const MachineStatus = () => {
  const [logType, setLogType] = useState('すべて')
  const [logDate, setLogDate] = useState('')

  const filteredLogs = errorLogSample.filter(log => {
    const typeMatch = logType === 'すべて' || log.type === logType
    const dateMatch = !logDate || log.date === logDate

    
return typeMatch && dateMatch
  })

  // ここから描画

  return (
    <Grid container spacing={6}>
      {/* タイトル・戻るリンク */}
      <Typography variant='h4' sx={{ mb: 0, fontWeight: 700 }}>生産機械ステータス</Typography>

      {/* 2カラムレイアウト */}
      <Grid item xs={12}>
        <Grid container spacing={4}>
          {/* 左カラム: 機械画像・状態 */}
          <Grid item xs={12} md={5}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant='h6' fontWeight='bold' mb={2}>{machineInfo.name}</Typography>
                <Box
                  sx={{
                    width: '100%',
                    borderRadius: 2,
                    overflow: 'hidden',
                    mb: 2,
                    bgcolor: 'grey.100',
                  }}
                >
                  <img
                    src={machineInfo.image}
                    alt={machineInfo.name}
                    style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                  />
                </Box>
                <Chip
                  label={machineInfo.status}
                  color={statusColorMap[machineInfo.statusColor]}
                  sx={{ width: '100%', fontSize: 18, py: 2, fontWeight: 'bold' }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* 右カラム: 稼働データ・エラーログ */}
          <Grid item xs={12} md={7}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant='h6' fontWeight='bold' mb={2}>稼働データ</Typography>
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={6} sm={3}>
                    <Box bgcolor='grey.50' p={2} borderRadius={2} textAlign='center'>
                      <Typography variant='body2' color='text.secondary'>本日の稼働時間</Typography>
                      <Typography variant='h5' fontWeight='bold'>{machineInfo.todayWorkTime}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box bgcolor='grey.50' p={2} borderRadius={2} textAlign='center'>
                      <Typography variant='body2' color='text.secondary'>本日の生産数</Typography>
                      <Typography variant='h5' fontWeight='bold'>{machineInfo.todayProduction}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box bgcolor='grey.50' p={2} borderRadius={2} textAlign='center'>
                      <Typography variant='body2' color='text.secondary'>最終点検日</Typography>
                      <Typography variant='h5' fontWeight='bold'>{machineInfo.lastInspection}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box bgcolor='grey.50' p={2} borderRadius={2} textAlign='center'>
                      <Typography variant='body2' color='text.secondary'>次回点検日</Typography>
                      <Typography variant='h5' fontWeight='bold'>{machineInfo.nextInspection}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* エラーログ */}
            <Card>
              <CardContent>
                <Box display='flex' flexDirection={{ xs: 'column', sm: 'row' }} justifyContent='space-between' alignItems={{ xs: 'flex-start', sm: 'center' }} mb={2} gap={2}>
                  <Typography variant='h6' fontWeight='bold'>エラーログ</Typography>
                  <Box display='flex' gap={2}>
                    <TextField
                      type='date'
                      size='small'
                      value={logDate}
                      onChange={e => setLogDate(e.target.value)}
                      sx={{ minWidth: 140 }}
                    />
                    <TextField
                      select
                      size='small'
                      value={logType}
                      onChange={e => setLogType(e.target.value)}
                      sx={{ minWidth: 100 }}
                    >
                      <MenuItem value='すべて'>すべて</MenuItem>
                      <MenuItem value='エラー'>エラー</MenuItem>
                      <MenuItem value='警告'>警告</MenuItem>
                      <MenuItem value='情報'>情報</MenuItem>
                    </TextField>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ maxHeight: 260, overflowY: 'auto' }}>
                  {filteredLogs.length === 0 ? (
                    <Box textAlign='center' py={6} color='text.secondary'>
                      <span className='material-icons' style={{ fontSize: 48, color: '#bdbdbd' }}>sentiment_dissatisfied</span>
                      <Typography variant='body1' mt={2}>該当するログが見つかりませんでした。</Typography>
                    </Box>
                  ) : (
                    filteredLogs.map((log, idx) => (
                      <Box
                        key={idx}
                        display='flex'
                        alignItems='center'
                        justifyContent='space-between'
                        bgcolor={
                          log.color === 'error' ? 'error.lighter' :
                          log.color === 'warning' ? 'warning.lighter' :
                          log.color === 'default' ? 'grey.100' : 'info.lighter'
                        }
                        borderRadius={2}
                        px={2}
                        py={1.5}
                        mb={1.5}
                      >
                        <Box>
                          <Typography fontWeight='bold' color={
                            log.color === 'error' ? 'error.main' :
                            log.color === 'warning' ? 'warning.main' :
                            log.color === 'default' ? 'text.primary' : 'info.main'
                          }>
                            {log.code}: {log.title}
                          </Typography>
                          {log.desc && (
                            <Typography variant='caption' color={
                              log.color === 'error' ? 'error.dark' :
                              log.color === 'warning' ? 'warning.dark' :
                              'text.secondary'
                            }>
                              {log.desc}
                            </Typography>
                          )}
                        </Box>
                        <Typography variant='body2' color='text.secondary' whiteSpace='nowrap'>
                          {log.date.replace(/-/g, '/')} {log.time}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default MachineStatus
