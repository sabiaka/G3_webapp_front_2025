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
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'

const EmployeeList = () => {
  const [employees] = useState([
    {
      id: 1,
      name: '田中太郎',
      avatar: '/images/avatars/1.png',
      employeeId: 'EMP001',
      department: '製造部',
      position: '主任',
      status: '在籍',
      joinDate: '2020-04-01',
      phone: '090-1234-5678',
      email: 'tanaka@company.com'
    },
    {
      id: 2,
      name: '佐藤花子',
      avatar: '/images/avatars/2.png',
      employeeId: 'EMP002',
      department: '品質管理部',
      position: '課長',
      status: '在籍',
      joinDate: '2018-07-01',
      phone: '090-2345-6789',
      email: 'sato@company.com'
    },
    {
      id: 3,
      name: '鈴木一郎',
      avatar: '/images/avatars/3.png',
      employeeId: 'EMP003',
      department: '製造部',
      position: '作業員',
      status: '在籍',
      joinDate: '2021-10-01',
      phone: '090-3456-7890',
      email: 'suzuki@company.com'
    },
    {
      id: 4,
      name: '高橋美咲',
      avatar: '/images/avatars/4.png',
      employeeId: 'EMP004',
      department: '品質管理部',
      position: '検査員',
      status: '在籍',
      joinDate: '2022-01-01',
      phone: '090-4567-8901',
      email: 'takahashi@company.com'
    },
    {
      id: 5,
      name: '伊藤健太',
      avatar: '/images/avatars/5.png',
      employeeId: 'EMP005',
      department: '製造部',
      position: '作業員',
      status: '休職',
      joinDate: '2019-03-01',
      phone: '090-5678-9012',
      email: 'ito@company.com'
    }
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case '在籍': return 'success'
      case '休職': return 'warning'
      case '退職': return 'error'
      default: return 'default'
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h4' className='mb-4'>
          従業員名簿
        </Typography>
      </Grid>
      
      {/* 従業員統計 */}
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='primary'>
              総従業員数
            </Typography>
            <Typography variant='h4'>156</Typography>
            <Typography variant='body2' color='text.secondary'>
              前月比 +3
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='success.main'>
              製造部
            </Typography>
            <Typography variant='h4'>89</Typography>
            <Typography variant='body2' color='text.secondary'>
              全従業員の57%
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='info.main'>
              品質管理部
            </Typography>
            <Typography variant='h4'>45</Typography>
            <Typography variant='body2' color='text.secondary'>
              全従業員の29%
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography variant='h6' color='warning.main'>
              その他部門
            </Typography>
            <Typography variant='h4'>22</Typography>
            <Typography variant='body2' color='text.secondary'>
              全従業員の14%
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* 検索・フィルター */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={2} alignItems='center'>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label='従業員名で検索'
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
                  label='部署'
                  variant='outlined'
                  size='small'
                  defaultValue='all'
                >
                  <option value='all'>すべて</option>
                  <option value='manufacturing'>製造部</option>
                  <option value='quality'>品質管理部</option>
                  <option value='other'>その他</option>
                </TextField>
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
                  <option value='active'>在籍</option>
                  <option value='leave'>休職</option>
                  <option value='retired'>退職</option>
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button variant='contained' fullWidth>
                  検索
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* 従業員一覧テーブル */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <div className='flex justify-between items-center mb-3'>
              <Typography variant='h6'>
                従業員一覧
              </Typography>
              <Button variant='contained' startIcon={<i className='ri-add-line' />}>
                新規登録
              </Button>
            </div>
            <TableContainer component={Paper} variant='outlined'>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>従業員</TableCell>
                    <TableCell>従業員ID</TableCell>
                    <TableCell>部署</TableCell>
                    <TableCell>役職</TableCell>
                    <TableCell align='center'>ステータス</TableCell>
                    <TableCell>入社日</TableCell>
                    <TableCell>連絡先</TableCell>
                    <TableCell align='center'>アクション</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <Avatar src={employee.avatar} />
                          <div>
                            <Typography variant='body2' className='font-medium'>
                              {employee.name}
                            </Typography>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.employeeId}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell align='center'>
                        <Chip
                          label={employee.status}
                          color={getStatusColor(employee.status)}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>{employee.joinDate}</TableCell>
                      <TableCell>
                        <div>
                          <Typography variant='body2'>{employee.phone}</Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {employee.email}
                          </Typography>
                        </div>
                      </TableCell>
                      <TableCell align='center'>
                        <IconButton size='small' color='primary'>
                          <i className='ri-eye-line' />
                        </IconButton>
                        <IconButton size='small' color='secondary'>
                          <i className='ri-edit-line' />
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
    </Grid>
  )
}

export default EmployeeList
