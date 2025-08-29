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
import LinearProgress from '@mui/material/LinearProgress'

const PartsInventory = () => {
  const [partsData] = useState([
    {
      id: 1,
      partNumber: 'P-001',
      name: 'ボルト M6x20',
      category: '標準部品',
      currentStock: 1250,
      minStock: 100,
      maxStock: 2000,
      unit: '個',
      location: 'A-1-1',
      supplier: '株式会社サプライ',
      lastUpdated: '2024-01-15 10:30'
    },
    {
      id: 2,
      partNumber: 'P-002',
      name: 'ナット M6',
      category: '標準部品',
      currentStock: 800,
      minStock: 200,
      maxStock: 1500,
      unit: '個',
      location: 'A-1-2',
      supplier: '株式会社サプライ',
      lastUpdated: '2024-01-15 09:15'
    },
    {
      id: 3,
      partNumber: 'P-003',
      name: 'ベアリング 6205',
      category: '機械部品',
      currentStock: 45,
      minStock: 50,
      maxStock: 200,
      unit: '個',
      location: 'B-2-1',
      supplier: '株式会社ベアリング',
      lastUpdated: '2024-01-14 16:45'
    },
    {
      id: 4,
      partNumber: 'P-004',
      name: 'シールリング 25x32x7',
      category: '機械部品',
      currentStock: 12,
      minStock: 30,
      maxStock: 100,
      unit: '個',
      location: 'B-2-2',
      supplier: '株式会社シール',
      lastUpdated: '2024-01-14 14:20'
    }
  ])

  const getStockStatus = (current, min, max) => {
    const percentage = (current / max) * 100
    if (current <= min) return { status: '在庫不足', color: 'error' }
    if (percentage >= 80) return { status: '在庫過多', color: 'warning' }
    return { status: '適正', color: 'success' }
  }

  const getStockPercentage = (current, max) => {
    return Math.round((current / max) * 100)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h4' className='mb-4'>
          部品在庫管理
        </Typography>
      </Grid>
      
      {/* 在庫状況サマリー */}
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='primary'>
              総部品数
            </Typography>
            <Typography variant='h4'>1,247</Typography>
            <Typography variant='body2' color='text.secondary'>
              種類
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='success.main'>
              在庫適正
            </Typography>
            <Typography variant='h4'>1,180</Typography>
            <Typography variant='body2' color='text.secondary'>
              種類 (94.6%)
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='warning.main'>
              在庫過多
            </Typography>
            <Typography variant='h4'>45</Typography>
            <Typography variant='body2' color='text.secondary'>
              種類 (3.6%)
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='error.main'>
              在庫不足
            </Typography>
            <Typography variant='h4'>22</Typography>
            <Typography variant='body2' color='text.secondary'>
              種類 (1.8%)
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
                  label='部品番号・名称で検索'
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
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  select
                  label='カテゴリ'
                  variant='outlined'
                  size='small'
                  defaultValue='all'
                >
                  <option value='all'>すべて</option>
                  <option value='standard'>標準部品</option>
                  <option value='mechanical'>機械部品</option>
                  <option value='electronic'>電子部品</option>
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  select
                  label='在庫状況'
                  variant='outlined'
                  size='small'
                  defaultValue='all'
                >
                  <option value='all'>すべて</option>
                  <option value='normal'>適正</option>
                  <option value='low'>不足</option>
                  <option value='high'>過多</option>
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  select
                  label='倉庫位置'
                  variant='outlined'
                  size='small'
                  defaultValue='all'
                >
                  <option value='all'>すべて</option>
                  <option value='A'>A棟</option>
                  <option value='B'>B棟</option>
                  <option value='C'>C棟</option>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button variant='contained' fullWidth className='mr-2'>
                  検索
                </Button>
                <Button variant='outlined' fullWidth>
                  在庫レポート
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* 部品一覧テーブル */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <div className='flex justify-between items-center mb-3'>
              <Typography variant='h6'>
                部品一覧
              </Typography>
              <div className='flex gap-2'>
                <Button variant='outlined' startIcon={<i className='ri-download-line' />}>
                  在庫CSV出力
                </Button>
                <Button variant='contained' startIcon={<i className='ri-add-line' />}>
                  新規部品登録
                </Button>
              </div>
            </div>
            <TableContainer component={Paper} variant='outlined'>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>部品番号</TableCell>
                    <TableCell>部品名</TableCell>
                    <TableCell>カテゴリ</TableCell>
                    <TableCell align='center'>在庫数</TableCell>
                    <TableCell align='center'>在庫状況</TableCell>
                    <TableCell align='center'>在庫率</TableCell>
                    <TableCell>単位</TableCell>
                    <TableCell>倉庫位置</TableCell>
                    <TableCell>仕入先</TableCell>
                    <TableCell>最終更新</TableCell>
                    <TableCell align='center'>アクション</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {partsData.map((part) => {
                    const stockStatus = getStockStatus(part.currentStock, part.minStock, part.maxStock)
                    const stockPercentage = getStockPercentage(part.currentStock, part.maxStock)
                    
                    return (
                      <TableRow key={part.id}>
                        <TableCell>
                          <Typography variant='body2' className='font-medium'>
                            {part.partNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>{part.name}</TableCell>
                        <TableCell>{part.category}</TableCell>
                        <TableCell align='center'>
                          <Typography variant='body2'>
                            {part.currentStock.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Chip
                            label={stockStatus.status}
                            color={stockStatus.color}
                            size='small'
                          />
                        </TableCell>
                        <TableCell align='center'>
                          <div className='flex items-center gap-2'>
                            <Typography variant='body2'>
                              {stockPercentage}%
                            </Typography>
                            <LinearProgress
                              variant='determinate'
                              value={stockPercentage}
                              color={stockStatus.color}
                              style={{ width: 60, height: 6 }}
                            />
                          </div>
                        </TableCell>
                        <TableCell>{part.unit}</TableCell>
                        <TableCell>{part.location}</TableCell>
                        <TableCell>{part.supplier}</TableCell>
                        <TableCell>{part.lastUpdated}</TableCell>
                        <TableCell align='center'>
                          <IconButton size='small' color='primary'>
                            <i className='ri-eye-line' />
                          </IconButton>
                          <IconButton size='small' color='secondary'>
                            <i className='ri-edit-line' />
                          </IconButton>
                          <IconButton size='small' color='success'>
                            <i className='ri-add-line' />
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

      {/* 在庫アラート */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' className='mb-3 text-error-600'>
              ⚠️ 在庫アラート
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <div className='p-3 bg-error-50 border border-error-200 rounded'>
                  <Typography variant='body2' className='font-medium mb-2'>
                    在庫不足: シールリング 25x32x7
                  </Typography>
                  <Typography variant='body2' color='text.secondary' className='mb-2'>
                    現在: 12個 / 最小在庫: 30個
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    発注推奨: 50個
                  </Typography>
                  <div className='mt-3'>
                    <Button variant='contained' color='error' size='small'>
                      発注依頼
                    </Button>
                  </div>
                </div>
              </Grid>
              <Grid item xs={12} md={6}>
                <div className='p-3 bg-warning-50 border border-warning-200 rounded'>
                  <Typography variant='body2' className='font-medium mb-2'>
                    在庫過多: ボルト M6x20
                  </Typography>
                  <Typography variant='body2' color='text.secondary' className='mb-2'>
                    現在: 1,250個 / 最大在庫: 2,000個
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    在庫率: 62.5%
                  </Typography>
                  <div className='mt-3'>
                    <Button variant='outlined' color='warning' size='small'>
                      在庫調整
                    </Button>
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

export default PartsInventory
