'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'

const MachineSignage = () => {
  const [signageData] = useState([
    {
      id: 1,
      name: '製造ラインA サイネージ',
      location: '1階製造エリア',
      status: '稼働中',
      currentProduct: '製品A',
      targetQuantity: 1000,
      currentQuantity: 850,
      efficiency: 95,
      temperature: 65,
      operator: '田中太郎',
      lastUpdate: '2024-01-15 14:30:25'
    },
    {
      id: 2,
      name: '製造ラインB サイネージ',
      location: '1階製造エリア',
      status: '稼働中',
      currentProduct: '製品B',
      targetQuantity: 500,
      currentQuantity: 500,
      efficiency: 88,
      temperature: 42,
      operator: '佐藤花子',
      lastUpdate: '2024-01-15 14:29:18'
    },
    {
      id: 3,
      name: '製造ラインC サイネージ',
      location: '2階製造エリア',
      status: 'メンテナンス中',
      currentProduct: '製品C',
      targetQuantity: 800,
      currentQuantity: 600,
      efficiency: 0,
      temperature: 25,
      operator: '鈴木一郎',
      lastUpdate: '2024-01-15 14:25:42'
    },
    {
      id: 4,
      name: '製造ラインD サイネージ',
      location: '2階製造エリア',
      status: '停止中',
      currentProduct: '製品D',
      targetQuantity: 300,
      currentQuantity: 300,
      efficiency: 0,
      temperature: 28,
      operator: '高橋美咲',
      lastUpdate: '2024-01-15 14:20:15'
    }
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case '稼働中': return 'success'
      case 'メンテナンス中': return 'warning'
      case '停止中': return 'error'
      default: return 'default'
    }
  }

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return 'success'
    if (efficiency >= 70) return 'warning'
    
return 'error'
  }

  const getProgressPercentage = (current, target) => {
    return Math.round((current / target) * 100)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h4' className='mb-4'>
          生産機械サイネージ
        </Typography>
      </Grid>
      
      {/* サイネージ状況サマリー */}
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='success.main'>
              稼働中
            </Typography>
            <Typography variant='h4'>2</Typography>
            <Typography variant='body2' color='text.secondary'>
              全4台中
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='warning.main'>
              メンテナンス中
            </Typography>
            <Typography variant='h4'>1</Typography>
            <Typography variant='body2' color='text.secondary'>
              全4台中
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='error.main'>
              停止中
            </Typography>
            <Typography variant='h4'>1</Typography>
            <Typography variant='body2' color='text.secondary'>
              全4台中
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='info.main'>
              総生産数
            </Typography>
            <Typography variant='h4'>2,250</Typography>
            <Typography variant='body2' color='text.secondary'>
              今日の実績
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* サイネージ一覧テーブル */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <div className='flex justify-between items-center mb-3'>
              <Typography variant='h6'>
                サイネージ一覧
              </Typography>
              <div className='flex gap-2'>
                <Button variant='outlined' startIcon={<i className='ri-refresh-line' />}>
                  更新
                </Button>
                <Button variant='contained' startIcon={<i className='ri-add-line' />}>
                  新規サイネージ登録
                </Button>
              </div>
            </div>
            <TableContainer component={Paper} variant='outlined'>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>サイネージ名</TableCell>
                    <TableCell>設置場所</TableCell>
                    <TableCell align='center'>ステータス</TableCell>
                    <TableCell>現在の製品</TableCell>
                    <TableCell align='center'>目標数</TableCell>
                    <TableCell align='center'>現在数</TableCell>
                    <TableCell align='center'>進捗率</TableCell>
                    <TableCell align='center'>効率</TableCell>
                    <TableCell align='center'>温度</TableCell>
                    <TableCell>担当者</TableCell>
                    <TableCell>最終更新</TableCell>
                    <TableCell align='center'>アクション</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {signageData.map((signage) => {
                    const progressPercentage = getProgressPercentage(signage.currentQuantity, signage.targetQuantity)
                    
                    return (
                      <TableRow key={signage.id}>
                        <TableCell>
                          <Typography variant='body2' className='font-medium'>
                            {signage.name}
                          </Typography>
                        </TableCell>
                        <TableCell>{signage.location}</TableCell>
                        <TableCell align='center'>
                          <Chip
                            label={signage.status}
                            color={getStatusColor(signage.status)}
                            size='small'
                          />
                        </TableCell>
                        <TableCell>{signage.currentProduct}</TableCell>
                        <TableCell align='center'>{signage.targetQuantity.toLocaleString()}</TableCell>
                        <TableCell align='center'>{signage.currentQuantity.toLocaleString()}</TableCell>
                        <TableCell align='center'>
                          <div className='flex items-center gap-2'>
                            <Typography variant='body2'>
                              {progressPercentage}%
                            </Typography>
                            <LinearProgress
                              variant='determinate'
                              value={progressPercentage}
                              color={getEfficiencyColor(progressPercentage)}
                              style={{ width: 60, height: 6 }}
                            />
                          </div>
                        </TableCell>
                        <TableCell align='center'>
                          <div className='flex items-center gap-2'>
                            <Typography variant='body2'>
                              {signage.efficiency}%
                            </Typography>
                            <LinearProgress
                              variant='determinate'
                              value={signage.efficiency}
                              color={getEfficiencyColor(signage.efficiency)}
                              style={{ width: 60, height: 6 }}
                            />
                          </div>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography variant='body2'>
                            {signage.temperature}°C
                          </Typography>
                        </TableCell>
                        <TableCell>{signage.operator}</TableCell>
                        <TableCell>
                          <Typography variant='body2' color='text.secondary'>
                            {signage.lastUpdate}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <IconButton size='small' color='primary'>
                            <i className='ri-eye-line' />
                          </IconButton>
                          <IconButton size='small' color='secondary'>
                            <i className='ri-settings-3-line' />
                          </IconButton>
                          <IconButton size='small' color='success'>
                            <i className='ri-fullscreen-line' />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* サイネージ表示プレビュー */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' className='mb-3'>
              サイネージ表示プレビュー
            </Typography>
            <Grid container spacing={3}>
              {signageData.slice(0, 2).map((signage) => (
                <Grid item xs={12} md={6} key={signage.id}>
                  <Box className='p-4 border-2 border-gray-200 rounded-lg bg-gray-50'>
                    <div className='text-center mb-4'>
                      <Typography variant='h5' className='font-bold mb-2'>
                        {signage.name}
                      </Typography>
                      <Chip
                        label={signage.status}
                        color={getStatusColor(signage.status)}
                        size='medium'
                      />
                    </div>
                    
                    <div className='grid grid-cols-2 gap-4 mb-4'>
                      <div className='text-center'>
                        <Typography variant='h6' color='primary'>
                          現在の製品
                        </Typography>
                        <Typography variant='h4' className='font-bold'>
                          {signage.currentProduct}
                        </Typography>
                      </div>
                      <div className='text-center'>
                        <Typography variant='h6' color='success.main'>
                          効率
                        </Typography>
                        <Typography variant='h4' className='font-bold'>
                          {signage.efficiency}%
                        </Typography>
                      </div>
                    </div>
                    
                    <div className='mb-4'>
                      <div className='flex justify-between items-center mb-2'>
                        <Typography variant='body2'>進捗</Typography>
                        <Typography variant='body2'>
                          {signage.currentQuantity} / {signage.targetQuantity}
                        </Typography>
                      </div>
                      <LinearProgress
                        variant='determinate'
                        value={getProgressPercentage(signage.currentQuantity, signage.targetQuantity)}
                        color={getEfficiencyColor(getProgressPercentage(signage.currentQuantity, signage.targetQuantity))}
                        style={{ height: 12 }}
                      />
                    </div>
                    
                    <div className='text-center text-sm text-gray-600'>
                      <Typography variant='body2'>
                        担当: {signage.operator} | 温度: {signage.temperature}°C
                      </Typography>
                      <Typography variant='caption'>
                        最終更新: {signage.lastUpdate}
                      </Typography>
                    </div>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* サイネージ設定 */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' className='mb-3'>
              サイネージ設定
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <div className='p-4 border border-gray-200 rounded'>
                  <Typography variant='subtitle1' className='mb-3'>
                    表示設定
                  </Typography>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <Typography variant='body2'>自動更新間隔</Typography>
                      <Chip label='30秒' size='small' />
                    </div>
                    <div className='flex items-center justify-between'>
                      <Typography variant='body2'>表示モード</Typography>
                      <Chip label='詳細表示' size='small' color='primary' />
                    </div>
                    <div className='flex items-center justify-between'>
                      <Typography variant='body2'>アラート表示</Typography>
                      <Chip label='有効' size='small' color='success' />
                    </div>
                  </div>
                </div>
              </Grid>
              <Grid item xs={12} md={6}>
                <div className='p-4 border border-gray-200 rounded'>
                  <Typography variant='subtitle1' className='mb-3'>
                    通知設定
                  </Typography>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <Typography variant='body2'>効率低下アラート</Typography>
                      <Chip label='80%以下' size='small' color='warning' />
                    </div>
                    <div className='flex items-center justify-between'>
                      <Typography variant='body2'>温度アラート</Typography>
                      <Chip label='70°C以上' size='small' color='error' />
                    </div>
                    <div className='flex items-center justify-between'>
                      <Typography variant='body2'>メール通知</Typography>
                      <Chip label='有効' size='small' color='success' />
                    </div>
                  </div>
                </div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default MachineSignage
