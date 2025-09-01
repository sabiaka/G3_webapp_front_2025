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

const MachineStatus = () => {
  const [machines] = useState([
    {
      id: 1,
      name: '製造ラインA',
      type: '自動組立機',
      status: '稼働中',
      efficiency: 95,
      temperature: 65,
      vibration: 0.2,
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-01-25',
      operator: '田中太郎'
    },
    {
      id: 2,
      name: '製造ラインB',
      type: '検査機',
      status: '稼働中',
      efficiency: 88,
      temperature: 42,
      vibration: 0.1,
      lastMaintenance: '2024-01-08',
      nextMaintenance: '2024-01-23',
      operator: '佐藤花子'
    },
    {
      id: 3,
      name: '製造ラインC',
      type: '包装機',
      status: 'メンテナンス中',
      efficiency: 0,
      temperature: 25,
      vibration: 0.0,
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-01-16',
      operator: '鈴木一郎'
    },
    {
      id: 4,
      name: '製造ラインD',
      type: '切断機',
      status: '停止中',
      efficiency: 0,
      temperature: 28,
      vibration: 0.0,
      lastMaintenance: '2024-01-12',
      nextMaintenance: '2024-01-27',
      operator: '高橋美咲'
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

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h4' className='mb-4'>
          生産機械ステータス
        </Typography>
      </Grid>
      
      {/* 機械状況サマリー */}
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
              平均効率
            </Typography>
            <Typography variant='h4'>45.8%</Typography>
            <Typography variant='body2' color='text.secondary'>
              前日比 -5.2%
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* 機械一覧テーブル */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <div className='flex justify-between items-center mb-3'>
              <Typography variant='h6'>
                機械一覧
              </Typography>
              <Button variant='contained' startIcon={<i className='ri-add-line' />}>
                新規機械登録
              </Button>
            </div>
            <TableContainer component={Paper} variant='outlined'>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>機械名</TableCell>
                    <TableCell>種類</TableCell>
                    <TableCell align='center'>ステータス</TableCell>
                    <TableCell align='center'>効率</TableCell>
                    <TableCell align='center'>温度</TableCell>
                    <TableCell align='center'>振動</TableCell>
                    <TableCell>最終メンテ</TableCell>
                    <TableCell>次回メンテ</TableCell>
                    <TableCell>担当者</TableCell>
                    <TableCell align='center'>アクション</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {machines.map((machine) => (
                    <TableRow key={machine.id}>
                      <TableCell>
                        <Typography variant='body2' className='font-medium'>
                          {machine.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{machine.type}</TableCell>
                      <TableCell align='center'>
                        <Chip
                          label={machine.status}
                          color={getStatusColor(machine.status)}
                          size='small'
                        />
                      </TableCell>
                      <TableCell align='center'>
                        <div className='flex items-center gap-2'>
                          <Typography variant='body2'>
                            {machine.efficiency}%
                          </Typography>
                          <LinearProgress
                            variant='determinate'
                            value={machine.efficiency}
                            color={getEfficiencyColor(machine.efficiency)}
                            style={{ width: 60, height: 6 }}
                          />
                        </div>
                      </TableCell>
                      <TableCell align='center'>
                        <Typography variant='body2'>
                          {machine.temperature}°C
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Typography variant='body2'>
                          {machine.vibration}mm/s
                        </Typography>
                      </TableCell>
                      <TableCell>{machine.lastMaintenance}</TableCell>
                      <TableCell>{machine.nextMaintenance}</TableCell>
                      <TableCell>{machine.operator}</TableCell>
                      <TableCell align='center'>
                        <IconButton size='small' color='primary'>
                          <i className='ri-eye-line' />
                        </IconButton>
                        <IconButton size='small' color='secondary'>
                          <i className='ri-settings-3-line' />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* アラート・通知 */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' className='mb-3'>
              アラート・通知
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <div className='flex items-center gap-2 p-3 bg-warning-50 border border-warning-200 rounded'>
                  <i className='ri-error-warning-line text-warning-600' />
                  <div>
                    <Typography variant='body2' className='font-medium'>
                      製造ラインCのメンテナンス完了予定
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      2024-01-16 09:00 完了予定
                    </Typography>
                  </div>
                </div>
              </Grid>
              <Grid item xs={12} md={6}>
                <div className='flex items-center gap-2 p-3 bg-info-50 border border-info-200 rounded'>
                  <i className='ri-information-line text-info-600' />
                  <div>
                    <Typography variant='body2' className='font-medium'>
                      製造ラインDの定期点検予定
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      2024-01-27 14:00 開始予定
                    </Typography>
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

export default MachineStatus
