"use client"

import { useMemo } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

const basePalette = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e']
const palette = Array.from(new Set([...basePalette, '#FF8800']))

const statusOptions = [
  { value: '在籍中', label: '在籍中' },
  { value: '退職済', label: '退職済' }
]

const EmployeeFormDialog = ({
  open,
  onClose,
  form,
  setForm,
  roles,
  lines,
  loadingRoles,
  loadingLines,
  isPasswordShown,
  togglePasswordShown,
  onSave,
  employees
}) => {
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

  const handleFormChange = e => {
    const { name, value } = e.target
    if (name === 'roleId' || name === 'lineId') {
      const v = value === '' ? '' : (typeof value === 'number' ? value : Number(value))
      setForm(prev => ({ ...prev, [name]: v }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const title = useMemo(() => (
    form.employeeUserId && employees?.some(e => e.id === form.employeeUserId) ? '従業員編集' : '従業員追加'
  ), [form.employeeUserId, employees])

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>{title}</DialogTitle>
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
                  color: '#fff'
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
                        onClick={() => setForm(prev => ({ ...prev, iconColor: color }))}
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
                          onClick={togglePasswordShown}
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
                  {statusOptions.map(opt => (
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
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={onSave} variant='contained'>保存</Button>
      </DialogActions>
    </Dialog>
  )
}

export default EmployeeFormDialog
