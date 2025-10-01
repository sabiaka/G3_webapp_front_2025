'use client'

import { useState, useEffect } from 'react'

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
  // 全角スペース・半角スペースどちらでも分割
  const parts = name.trim().split(/\s+/)


  // 姓（最初の部分）だけ返す
  return parts[0] || ''
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
          <Avatar
            sx={{
              width: 56,
              height: 56,
              marginRight: 2,
              bgcolor: employee.iconColor,
              fontWeight: 700,
              fontSize: 24,
              color: '#fff' // ここで文字色を白に指定
            }}
          >
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

  // Register と同様のフォーム構成
  const [form, setForm] = useState({
    employeeUserId: '',
    lastName: '',
    firstName: '',
    password: '',
    roleId: '', // number | ''
    lineId: '', // number | ''
    status: '在籍中',
    specialNotes: '',
    iconColor: '#FF8800'
  })

  // Password 表示切替
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const handleClickShowPassword = () => setIsPasswordShown(s => !s)

  // マスタ（役割／ライン）
  const [roles, setRoles] = useState([])
  const [lines, setLines] = useState([])
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [loadingLines, setLoadingLines] = useState(true)

  // フィルタリング
  const filtered = employees.filter(emp => {
    const nameMatch = emp.name.toLowerCase().includes(search.toLowerCase())
    const depMatch = department === 'all' || emp.department === department
    const statusMatch = status === 'all' || emp.status === status


    return nameMatch && depMatch && statusMatch
  })

  // Register 同等: 表示名/アバターテキスト
  const getDisplayName = (ln, fn) => {
    const l = String(ln || '').trim()
    const f = String(fn || '').trim()
    if (!l && !f) return '氏名'
    return f ? `${l} ${f}` : l
  }

  const getAvatarText = (ln, fn) => {
    const base = String(ln || fn || '氏名').trim()
    if (!base) return '氏名'
    return base.slice(0, 3)
  }

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
    setForm(prev => ({
      employeeUserId: '',
      lastName: '',
      firstName: '',
      password: '',
      roleId: roles.length > 0 ? (roles.find(r => r?.role_name === '一般')?.role_id ?? roles[0]?.role_id ?? '') : '',
      lineId: '',
      status: '在籍中',
      specialNotes: '',
      iconColor: '#FF8800'
    }))
    setIsPasswordShown(false)
    setModalOpen(true)
  }

  const openEditModal = () => {
    if (selectedEmployee) {
      // 氏名を姓/名に分割（最初のスペースで分割）
      const name = String(selectedEmployee.name || '').trim()
      const [ln, ...rest] = name.split(/\s+/)
      const fn = rest.join(' ')

      // 役割ID/ラインID を名称から推測
      const roleId = roles.find(r => r?.role_name === selectedEmployee.role)?.role_id ?? ''
      const lineId = lines.find(l => l?.line_name === selectedEmployee.department)?.line_id ?? ''

      setForm({
        employeeUserId: selectedEmployee.id || '',
        lastName: ln || '',
        firstName: fn || '',
        password: '', // 既存編集では未入力
        roleId: roleId === 0 ? 0 : roleId || '',
        lineId: lineId === 0 ? 0 : lineId || '',
        status: selectedEmployee.status || '在籍中',
        specialNotes: selectedEmployee.notes || '',
        iconColor: selectedEmployee.iconColor || '#FF8800'
      })
      setIsPasswordShown(false)
      setModalOpen(true)
      handleMenuClose()
    }
  }

  const closeModal = () => setModalOpen(false)

  // フォーム
  const handleFormChange = e => {
    const { name, value } = e.target
    // 数値IDは number へ（空は ''）
    if (name === 'roleId' || name === 'lineId') {
      const v = value === '' ? '' : (typeof value === 'number' ? value : Number(value))
      setForm(prev => ({ ...prev, [name]: v }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleColorPick = color => setForm(prev => ({ ...prev, iconColor: color }))

  // 保存
  const handleSave = () => {
    // Register と揃えた最小バリデーション
    const requiredOk = form.employeeUserId && form.lastName && form.firstName
    const rolesOk = roles.length > 0 ? (form.roleId !== '' && form.roleId !== null && form.roleId !== undefined) : true
    if (!requiredOk || !rolesOk) return

    // 表示用名称を解決
    const roleName = roles.find(r => r?.role_id === form.roleId)?.role_name || (selectedEmployee?.role || '')
    const lineName = form.lineId === '' ? (selectedEmployee?.department || '') : (lines.find(l => l?.line_id === form.lineId)?.line_name || '')

    const displayName = getDisplayName(form.lastName, form.firstName)
    const updated = {
      id: form.employeeUserId,
      name: displayName,
      department: lineName || '',
      role: roleName || '',
      status: form.status || '在籍中',
      notes: form.specialNotes || '',
      iconColor: form.iconColor || '#FF8800'
    }

    if (employees.some(e => e.id === updated.id)) {
      setEmployees(emps => emps.map(e => e.id === updated.id ? { ...e, ...updated } : e))
    } else {
      setEmployees(emps => [...emps, updated])
    }

    setModalOpen(false)
  }

  // 削除
  const handleDelete = () => {
    if (selectedEmployee) {
      setEmployees(emps => emps.filter(e => e.id !== selectedEmployee.id))
      handleMenuClose()
    }
  }

  // カラーパレット
  const basePalette = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e']
  const palette = Array.from(new Set([...basePalette, '#FF8800']))

  // マスタ取得（ロール／ライン）
  useEffect(() => {
    const ac = new AbortController()
    const apiBase = process.env.NEXT_PUBLIC_BASE_PATH || ''

      // Roles
      ; (async () => {
        try {
          setLoadingRoles(true)
          const res = await fetch(`${apiBase}/api/roles`, { signal: ac.signal })
          if (res.ok) {
            const data = await res.json()
            const list = Array.isArray(data) ? data : []
            setRoles(list)
            // 既存選択を優先し、なければ「一般」→先頭→空
            setForm(prev => {
              const keep = prev.roleId
              if ((keep || keep === 0) && list.some(r => r?.role_id === keep)) return prev
              const general = list.find(r => r?.role_name === '一般')?.role_id
              return { ...prev, roleId: general ?? list[0]?.role_id ?? '' }
            })
          } else {
            setRoles([])
          }
        } catch (e) {
          setRoles([])
        } finally {
          setLoadingRoles(false)
        }
      })()

      // Lines
      ; (async () => {
        try {
          setLoadingLines(true)
          const res = await fetch(`${apiBase}/api/lines`, { signal: ac.signal })
          if (res.ok) {
            const data = await res.json()
            const list = Array.isArray(data) ? data : []
            setLines(list)
            // 既存選択がリストにない場合は空
            setForm(prev => {
              const keep = prev.lineId
              if ((keep || keep === 0) && list.some(l => l?.line_id === keep)) return prev
              return { ...prev, lineId: '' }
            })
          } else {
            setLines([])
          }
        } catch (e) {
          setLines([])
        } finally {
          setLoadingLines(false)
        }
      })()

    return () => ac.abort()
  }, [])

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
        <DialogTitle>{form.employeeUserId && employees.some(e => e.id === form.employeeUserId) ? '従業員編集' : '従業員追加'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: form.iconColor,
                    fontSize: 36,
                    fontWeight: 700,
                    mb: 2,
                    color: '#fff' // ここで文字色を白に指定
                  }}
                >
                  {getAvatarText(form.lastName, form.firstName)}
                </Avatar>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>{getDisplayName(form.lastName, form.firstName)}</Typography>
                <Typography variant='body2' color='text.secondary'>{form.employeeUserId || 'ID'}</Typography>
                <div style={{ marginTop: 24, width: '100%' }}>
                  <Typography variant='body2' sx={{ mb: 1 }}>色を選択</Typography>
                  <Grid container spacing={1}>
                    {palette.map(color => (
                      <Grid item xs={2} key={color}>
                        <div
                          onClick={() => handleColorPick(color)}
                          style={{ background: color, width: 24, height: 24, borderRadius: '50%', cursor: 'pointer', border: form.iconColor === color ? '2px solid #6366f1' : '2px solid #fff', boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }}
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
                  <TextField
                    autoFocus
                    fullWidth
                    label='ユーザーID'
                    placeholder='hana.kato'
                    name='employeeUserId'
                    value={form.employeeUserId}
                    onChange={handleFormChange}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label='姓'
                    placeholder='加藤'
                    name='lastName'
                    value={form.lastName}
                    onChange={handleFormChange}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label='名'
                    placeholder='花'
                    name='firstName'
                    value={form.firstName}
                    onChange={handleFormChange}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='パスワード'
                    type={isPasswordShown ? 'text' : 'password'}
                    name='password'
                    value={form.password}
                    onChange={handleFormChange}
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            size='small'
                            edge='end'
                            onClick={handleClickShowPassword}
                            onMouseDown={e => e.preventDefault()}
                          >
                            <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    select
                    label='役割'
                    name='roleId'
                    value={form.roleId === '' ? '' : form.roleId}
                    onChange={handleFormChange}
                    disabled={loadingRoles || roles.length === 0}
                    SelectProps={{ MenuProps: { disablePortal: true } }}
                    sx={{ mb: 2 }}
                  >
                    {loadingRoles ? (
                      <MenuItem value='' disabled>読み込み中…</MenuItem>
                    ) : (
                      roles.map(role => (
                        <MenuItem key={role?.role_id ?? role?.role_name} value={role?.role_id}>
                          {role?.role_name}{role?.is_admin ? '（管理者）' : ''}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    select
                    label='担当ライン'
                    name='lineId'
                    value={form.lineId === '' ? '' : form.lineId}
                    onChange={handleFormChange}
                    disabled={loadingLines}
                    SelectProps={{ MenuProps: { disablePortal: true } }}
                    helperText={(!loadingLines && lines.length === 0) ? 'ラインが未登録です。管理画面から追加してください。' : '　'}
                    sx={{ mb: 2 }}
                  >
                    <MenuItem value=''>未選択</MenuItem>
                    {loadingLines ? (
                      <MenuItem value='' disabled>読み込み中…</MenuItem>
                    ) : (
                      lines.map(line => (
                        <MenuItem key={line?.line_id ?? line?.line_name} value={line?.line_id}>
                          {line?.line_name}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    select
                    label='在籍状況'
                    name='status'
                    value={form.status}
                    onChange={handleFormChange}
                    SelectProps={{ MenuProps: { disablePortal: true } }}
                    helperText='　'
                    sx={{ mb: 2 }}
                  >
                    {statusOptions.filter(opt => opt.value !== 'all').map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='特記事項'
                    placeholder='夜勤中心 など'
                    name='specialNotes'
                    value={form.specialNotes}
                    onChange={handleFormChange}
                    multiline
                    minRows={2}
                    sx={{ mb: 2 }}
                  />
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
