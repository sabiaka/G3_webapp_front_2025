
'use client'

import { useState } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import Avatar from '@mui/material/Avatar'
import Fab from '@mui/material/Fab'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import AddIcon from '@mui/icons-material/Add'

const initialEmployees = [
  { id: '12345', name: '山田 太郎', department: '組立', role: 'リーダー', status: '在籍中', notes: 'フォークリフト免許保持', iconColor: '#a3a8e6' },
  { id: '12346', name: '佐藤 花子', department: '塗装', role: 'スタッフ', status: '在籍中', notes: '色彩検定2級', iconColor: '#e6a3c8' },
  { id: '12347', name: '鈴木 一郎', department: '検査', role: '主任', status: '在籍中', notes: '-', iconColor: '#a3e6c8' },
  { id: '10001', name: '高橋 次郎', department: '管理', role: '部長', status: '在籍中', notes: '-', iconColor: '#e6dca3' },
  { id: '12348', name: '田中 三郎', department: '組立', role: 'スタッフ', status: '退職済', notes: '2024/03/31付', iconColor: '#b0b0b0' },
  { id: '12349', name: '渡辺 直美', department: '検査', role: 'スタッフ', status: '在籍中', notes: '新人研修中', iconColor: '#e6a3a3' },
]

const departmentOptions = [
  { value: 'all', label: 'すべて' },
  { value: '組立', label: '組立' },
  { value: '塗装', label: '塗装' },
  { value: '検査', label: '検査' },
  { value: '管理', label: '管理' },
]
const statusOptions = [
  { value: 'all', label: 'すべて' },
  { value: '在籍中', label: '在籍中' },
  { value: '退職済', label: '退職済' },
]

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2)
}

const EmployeeCard = ({ employee, onMenuClick }) => {
  const isRetired = employee.status === '退職済'
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2, opacity: isRetired ? 0.6 : 1, position: 'relative' }}>
      <IconButton
        size='small'
        sx={{ position: 'absolute', top: 8, right: 8 }}
        onClick={e => onMenuClick(e, employee)}
      >
        <MoreVertIcon fontSize='small' />
      </IconButton>
      <CardContent>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <Avatar sx={{ width: 56, height: 56, marginRight: 2, bgcolor: employee.iconColor, fontWeight: 700, fontSize: 24 }}>
            {getInitials(employee.name)}
          </Avatar>
          <div>
            <Typography variant='h6' sx={{ fontWeight: 700, color: isRetired ? 'text.disabled' : 'text.primary' }}>{employee.name}</Typography>
            <Typography variant='body2' color='text.secondary'>ID: {employee.id}</Typography>
          </div>
        </div>
        <Typography variant='body2'><b>担当:</b> <span style={{ color: isRetired ? '#888' : '#6366f1', fontWeight: 500 }}>{employee.department}</span></Typography>
        <Typography variant='body2'><b>役職:</b> {employee.role}</Typography>
        <Typography variant='body2'>
          <b>在籍状況:</b> <span style={{ background: isRetired ? '#f3f4f6' : '#bbf7d0', color: isRetired ? '#888' : '#15803d', borderRadius: 8, padding: '2px 10px', fontWeight: 600, fontSize: 13 }}>{employee.status}</span>
        </Typography>
        <Typography variant='body2'><b>備考:</b> {employee.notes}</Typography>
      </CardContent>
    </Card>
  )
}

const EmployeeList = () => {
  const [employees, setEmployees] = useState(initialEmployees)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('all')
  const [status, setStatus] = useState('all')
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', id: '', department: '', role: '', status: '在籍中', notes: '', iconColor: '#6366f1' })

  // フィルタリング
  const filtered = employees.filter(emp => {
    const nameMatch = emp.name.toLowerCase().includes(search.toLowerCase())
    const depMatch = department === 'all' || emp.department === department
    const statusMatch = status === 'all' || emp.status === status
    return nameMatch && depMatch && statusMatch
  })

  // メニュー
  const handleMenuClick = (e, employee) => {
    setMenuAnchor(e.currentTarget)
    setSelectedEmployee(employee)
  }
  const handleMenuClose = () => {
    setMenuAnchor(null)
    setSelectedEmployee(null)
  }

  // モーダル
  const openAddModal = () => {
    setForm({ name: '', id: '', department: '', role: '', status: '在籍中', notes: '', iconColor: '#6366f1' })
    setModalOpen(true)
  }
  const openEditModal = () => {
    if (selectedEmployee) {
      setForm(selectedEmployee)
      setModalOpen(true)
      handleMenuClose()
    }
  }
  const closeModal = () => setModalOpen(false)

  // フォーム
  const handleFormChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }
  const handleColorPick = color => setForm(prev => ({ ...prev, iconColor: color }))

  // 保存
  const handleSave = () => {
    if (form.name && form.id) {
      if (employees.some(e => e.id === form.id)) {
        setEmployees(emps => emps.map(e => e.id === form.id ? { ...form } : e))
      } else {
        setEmployees(emps => [...emps, { ...form }])
      }
      setModalOpen(false)
    }
  }

  // 削除
  const handleDelete = () => {
    if (selectedEmployee) {
      setEmployees(emps => emps.filter(e => e.id !== selectedEmployee.id))
      handleMenuClose()
    }
  }

  // カラーパレット
  const palette = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e']

  return (
    <>
      <Typography variant='h4' sx={{ mb: 4, fontWeight: 700 }}>従業員名簿</Typography>

      {/* 検索・フィルターバー */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 1 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label='氏名で検索'
                size='small'
                value={search}
                onChange={e => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <span className='ri-search-line' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <Select
                fullWidth
                size='small'
                value={department}
                onChange={e => setDepartment(e.target.value)}
                displayEmpty
              >
                {departmentOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={6} md={2}>
              <Select
                fullWidth
                size='small'
                value={status}
                onChange={e => setStatus(e.target.value)}
                displayEmpty
              >
                {statusOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 従業員リスト（カードグリッド） */}
      <Grid container spacing={3}>
        {filtered.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant='h6' color='text.secondary' sx={{ mb: 1 }}>該当する従業員が見つかりませんでした。</Typography>
              <Typography variant='body2' color='text.disabled'>検索条件を変更して、もう一度お試しください。</Typography>
            </Card>
          </Grid>
        ) : (
          filtered.map(emp => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={emp.id}>
              <EmployeeCard employee={emp} onMenuClick={handleMenuClick} />
            </Grid>
          ))
        )}
      </Grid>

      {/* フローティング追加ボタン */}
      <Fab color='primary' aria-label='add' sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }} onClick={openAddModal}>
        <AddIcon fontSize='large' />
      </Fab>

      {/* ドロップダウンメニュー */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={openEditModal}>編集</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>削除</MenuItem>
      </Menu>

      {/* モーダル（従業員追加・編集） */}
      <Dialog open={modalOpen} onClose={closeModal} maxWidth='md' fullWidth>
        <DialogTitle>{form.id && employees.some(e => e.id === form.id) ? '従業員編集' : '従業員追加'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: form.iconColor, fontSize: 36, fontWeight: 700, mb: 2 }}>{getInitials(form.name || '氏名')}</Avatar>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>{form.name || '氏名'}</Typography>
                <Typography variant='body2' color='text.secondary'>{form.id || 'ID'}</Typography>
                <div style={{ marginTop: 24, width: '100%' }}>
                  <Typography variant='body2' sx={{ mb: 1 }}>色を選択</Typography>
                  <Grid container spacing={1}>
                    {palette.map(color => (
                      <Grid item xs={2} key={color}>
                        <div
                          onClick={() => handleColorPick(color)}
                          style={{ background: color, width: 24, height: 24, borderRadius: '50%', cursor: 'pointer', border: form.iconColor === color ? '2px solid #6366f1' : '2px solid #fff' }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </div>
              </div>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label='名前 (フルネーム)' name='name' value={form.name} onChange={handleFormChange} fullWidth size='small' sx={{ mb: 2 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label='役職' name='role' value={form.role} onChange={handleFormChange} fullWidth size='small' sx={{ mb: 2 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label='ID' name='id' value={form.id} onChange={handleFormChange} fullWidth size='small' sx={{ mb: 2 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label='担当ライン' name='department' value={form.department} onChange={handleFormChange} fullWidth size='small' sx={{ mb: 2 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Select label='在籍状況' name='status' value={form.status} onChange={handleFormChange} fullWidth size='small' sx={{ mb: 2 }}>
                    {statusOptions.filter(opt => opt.value !== 'all').map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={12}>
                  <TextField label='特記事項' name='notes' value={form.notes} onChange={handleFormChange} fullWidth size='small' multiline rows={2} sx={{ mb: 2 }} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>キャンセル</Button>
          <Button onClick={handleSave} variant='contained'>保存</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default EmployeeList
