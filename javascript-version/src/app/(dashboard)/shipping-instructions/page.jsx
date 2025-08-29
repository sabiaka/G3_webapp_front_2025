'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'

const ShippingInstructions = () => {
  const [shippingData] = useState([
    {
      id: 1,
      orderNumber: 'SO-2024-001',
      customer: '株式会社ABC',
      product: '製品A',
      quantity: 500,
      status: '出荷準備中',
      priority: '高',
      shippingDate: '2024-01-20',
      deliveryDate: '2024-01-22',
      responsible: '田中太郎'
    },
    {
      id: 2,
      orderNumber: 'SO-2024-002',
      customer: '株式会社XYZ',
      product: '製品B',
      quantity: 300,
      status: '出荷完了',
      priority: '中',
      shippingDate: '2024-01-18',
      deliveryDate: '2024-01-21',
      responsible: '佐藤花子'
    },
    {
      id: 3,
      orderNumber: 'SO-2024-003',
      customer: '株式会社DEF',
      product: '製品C',
      quantity: 800,
      status: '製造中',
      priority: '高',
      shippingDate: '2024-01-25',
      deliveryDate: '2024-01-28',
      responsible: '鈴木一郎'
    },
    {
      id: 4,
      orderNumber: 'SO-2024-004',
      customer: '株式会社GHI',
      product: '製品D',
      quantity: 200,
      status: '出荷準備中',
      priority: '低',
      shippingDate: '2024-01-19',
      deliveryDate: '2024-01-23',
      responsible: '高橋美咲'
    }
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case '出荷完了': return 'success'
      case '出荷準備中': return 'warning'
      case '製造中': return 'info'
      case '遅延': return 'error'
      default: return 'default'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case '高': return 'error'
      case '中': return 'warning'
      case '低': return 'success'
      default: return 'default'
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h4' className='mb-4'>
          製造出荷指示周知
        </Typography>
      </Grid>
      
      {/* 出荷状況サマリー */}
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='info.main'>
              今日の出荷予定
            </Typography>
            <Typography variant='h4'>12</Typography>
            <Typography variant='body2' color='text.secondary'>
              件
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='success.main'>
              出荷完了
            </Typography>
            <Typography variant='h4'>8</Typography>
            <Typography variant='body2' color='text.secondary'>
              件
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='warning.main'>
              出荷準備中
            </Typography>
            <Typography variant='h4'>3</Typography>
            <Typography variant='body2' color='text.secondary'>
              件
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='error.main'>
              遅延
            </Typography>
            <Typography variant='h4'>1</Typography>
            <Typography variant='body2' color='text.secondary'>
              件
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* 検索・フィルター */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={2} alignItems='center'>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label='受注番号で検索'
                  variant='outlined'
                  size='small'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='ri-search-line' />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label='ステータス'
                  variant='outlined'
                  size='small'
                  defaultValue='all'
                >
                  <option value='all'>すべて</option>
                  <option value='manufacturing'>製造中</option>
                  <option value='preparing'>出荷準備中</option>
                  <option value='shipped'>出荷完了</option>
                  <option value='delayed'>遅延</option>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label='優先度'
                  variant='outlined'
                  size='small'
                  defaultValue='all'
                >
                  <option value='all'>すべて</option>
                  <option value='high'>高</option>
                  <option value='medium'>中</option>
                  <option value='low'>低</option>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button variant='contained' fullWidth>
                  検索
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* 出荷指示一覧テーブル */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <div className='flex justify-between items-center mb-3'>
              <Typography variant='h6'>
                出荷指示一覧
              </Typography>
              <Button variant='contained' startIcon={<i className='ri-add-line' />}>
                新規出荷指示
              </Button>
            </div>
            <TableContainer component={Paper} variant='outlined'>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>受注番号</TableCell>
                    <TableCell>顧客名</TableCell>
                    <TableCell>製品</TableCell>
                    <TableCell align='right'>数量</TableCell>
                    <TableCell align='center'>ステータス</TableCell>
                    <TableCell align='center'>優先度</TableCell>
                    <TableCell>出荷予定日</TableCell>
                    <TableCell>納期</TableCell>
                    <TableCell>担当者</TableCell>
                    <TableCell align='center'>アクション</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shippingData.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Typography variant='body2' className='font-medium'>
                          {order.orderNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.product}</TableCell>
                      <TableCell align='right'>{order.quantity}</TableCell>
                      <TableCell align='center'>
                        <Chip
                          label={order.status}
                          color={getStatusColor(order.status)}
                          size='small'
                        />
                      </TableCell>
                      <TableCell align='center'>
                        <Chip
                          label={order.priority}
                          color={getPriorityColor(order.priority)}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>{order.shippingDate}</TableCell>
                      <TableCell>{order.deliveryDate}</TableCell>
                      <TableCell>{order.responsible}</TableCell>
                      <TableCell align='center'>
                        <IconButton size='small' color='primary'>
                          <i className='ri-eye-line' />
                        </IconButton>
                        <IconButton size='small' color='secondary'>
                          <i className='ri-edit-line' />
                        </IconButton>
                        <IconButton size='small' color='success'>
                          <i className='ri-ship-line' />
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

      {/* 緊急出荷指示 */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' className='mb-3 text-error-600'>
              ⚠️ 緊急出荷指示
            </Typography>
            <div className='p-3 bg-error-50 border border-error-200 rounded'>
              <Typography variant='body2' className='font-medium mb-2'>
                受注番号: SO-2024-001 (株式会社ABC)
              </Typography>
              <Typography variant='body2' color='text.secondary' className='mb-2'>
                製品A 500個 - 納期: 2024-01-22
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                優先度: 高 - 担当: 田中太郎
              </Typography>
              <div className='mt-3'>
                <Button variant='contained' color='error' size='small' className='mr-2'>
                  出荷確認
                </Button>
                <Button variant='outlined' color='error' size='small'>
                  詳細確認
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ShippingInstructions
