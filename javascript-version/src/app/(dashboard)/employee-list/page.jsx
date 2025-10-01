"use client"

import { useState, useEffect, useMemo, useRef } from 'react'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Fab from '@mui/material/Fab'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import AddIcon from '@mui/icons-material/Add'
import useAuthMe from '@core/hooks/useAuthMe'

import EmployeeCard from './components/EmployeeCard'
import FiltersBar from './components/FiltersBar'
import EmployeeFormDialog from './components/EmployeeFormDialog'
import { getAuthHeaders, ensureHash, stripHash } from './utils/api'

const statusOptions = [
  { value: 'all', label: 'すべて' },
  { value: '在籍中', label: '在籍中' },
  { value: '退職済', label: '退職済' }
]

const EmployeeList = () => {
  const [employees, setEmployees] = useState([])
  const [employeesLoading, setEmployeesLoading] = useState(false)
  const [employeesError, setEmployeesError] = useState(null)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('all')
  const [status, setStatus] = useState('all')
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const { isAdmin } = useAuthMe()
  const apiBase = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const debounceTimer = useRef(null)

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
  const [editingEmployeeId, setEditingEmployeeId] = useState(null) // numeric employee_id for PUT/DELETE

  // サーバー側でフィルタ済みを取得するため、そのまま表示
  const filtered = employees

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
    if (!isAdmin) return
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
    setEditingEmployeeId(null)
    setModalOpen(true)
  }

  const openEditModal = () => {
    if (!isAdmin) return
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
      setEditingEmployeeId(selectedEmployee.employeeId ?? null)
      setModalOpen(true)
      handleMenuClose()
    }
  }

  const closeModal = () => setModalOpen(false)

  // フォーム
  const handleFormChange = e => {
    const { name, value } = e.target
    if (name === 'roleId' || name === 'lineId') {
      const v = value === '' ? '' : (typeof value === 'number' ? value : Number(value))
      setForm(prev => ({ ...prev, [name]: v }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  // 保存
  const handleSave = async () => {
    if (!isAdmin) return
    // 最小バリデーション
    const requiredOk = form.employeeUserId && form.lastName && form.firstName
    const rolesOk = roles.length > 0 ? (form.roleId !== '' && form.roleId !== null && form.roleId !== undefined) : true
    if (!requiredOk || !rolesOk) return

    const displayName = getDisplayName(form.lastName, form.firstName)
    const payload = {
      employee_name: displayName,
      employee_user_id: form.employeeUserId,
      password: form.password ? form.password : (editingEmployeeId ? null : ''),
      role_id: form.roleId,
      // line_id は未選択時は送らない
      ...(form.lineId === '' ? {} : { line_id: form.lineId }),
      color_code: stripHash(form.iconColor || '#FF8800'),
      special_notes: form.specialNotes || '',
      // 在籍状況
      ...(typeof form.status === 'string' ? { is_active: form.status === '在籍中' } : {})
    }

    try {
      const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() }
      if (editingEmployeeId) {
        // 更新（PUT）
        const res = await fetch(`${apiBase}/api/employees/${editingEmployeeId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error(`PUT /employees/${editingEmployeeId} ${res.status}`)
      } else {
        // 追加（POST）: password 必須
        if (!form.password) throw new Error('パスワードを入力してください')
        const res = await fetch(`${apiBase}/api/employees`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error(`POST /employees ${res.status}`)
      }
      // 再取得
      await fetchEmployees()
      setModalOpen(false)
    } catch (e) {
      // TODO: エラーハンドリング（スナックバー等）
      console.error(e)
    }
  }

  // 削除
  const handleDelete = async () => {
    if (!isAdmin) return
    if (!selectedEmployee?.employeeId) return
    try {
      const headers = { ...getAuthHeaders() }
      const res = await fetch(`${apiBase}/api/employees/${selectedEmployee.employeeId}`, { method: 'DELETE', headers })
      if (!res.ok && res.status !== 204) throw new Error(`DELETE /employees/${selectedEmployee.employeeId} ${res.status}`)
      await fetchEmployees()
    } catch (e) {
      console.error(e)
    } finally {
      handleMenuClose()
    }
  }

  // UI パレットはフォームダイアログ内に移動

  // マスタ取得（ロール／ライン）
  useEffect(() => {
    const ac = new AbortController()
    const headers = { ...getAuthHeaders() }

      // Roles
      ; (async () => {
        try {
          setLoadingRoles(true)
          const res = await fetch(`${apiBase}/api/roles`, { signal: ac.signal, headers })
          if (res.ok) {
            const data = await res.json()
            const list = Array.isArray(data) ? data : (Array.isArray(data?.roles) ? data.roles : [])
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
          const res = await fetch(`${apiBase}/api/lines`, { signal: ac.signal, headers })
          if (res.ok) {
            const data = await res.json()
            const list = Array.isArray(data) ? data : (Array.isArray(data?.lines) ? data.lines : [])
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

  // 部署（ライン）フィルタの選択肢
  const departmentOptions = useMemo(() => {
    const opts = [{ value: 'all', label: 'すべて' }]
    lines.forEach(l => {
      if (l?.line_name) opts.push({ value: l.line_name, label: l.line_name })
    })
    return opts
  }, [lines])

  // APIレスポンスをUI表示用に整形
  const mapEmployee = apiItem => ({
    employeeId: apiItem?.employee_id,
    id: apiItem?.employee_user_id, // 表示用ID
    employeeUserId: apiItem?.employee_user_id,
    name: apiItem?.employee_name,
    department: apiItem?.line_name || '',
    role: apiItem?.role_name || '',
    status: apiItem?.is_active ? '在籍中' : '退職済',
    notes: apiItem?.special_notes || '',
    iconColor: ensureHash(apiItem?.color_code)
  })

  // 従業員取得（検索・フィルタ対応）
  const fetchEmployees = async () => {
    const headers = { ...getAuthHeaders() }
    const sp = new URLSearchParams()
    if (search?.trim()) sp.set('name_like', search.trim())
    if (department !== 'all') sp.set('line_name', department)
    if (status !== 'all') sp.set('is_active', String(status === '在籍中'))
    const url = `${apiBase}/api/employees${sp.toString() ? `?${sp.toString()}` : ''}`
    try {
      setEmployeesLoading(true)
      setEmployeesError(null)
      const res = await fetch(url, { headers })
      if (!res.ok) throw new Error(`GET /employees ${res.status}`)
      const data = await res.json()
      const list = Array.isArray(data)
        ? data
        : (Array.isArray(data?.employees) ? data.employees : [])
      setEmployees(list.map(mapEmployee))
    } catch (e) {
      console.error(e)
      setEmployeesError(e)
      setEmployees([])
    } finally {
      setEmployeesLoading(false)
    }
  }

  // フィルタ変更時に再取得（検索はデバウンス）
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      fetchEmployees()
    }, 350)
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, department, status])

  return (
    <>
      <Typography variant='h4' sx={{ mb: 4, fontWeight: 700 }}>従業員名簿</Typography>

      <FiltersBar
        search={search}
        setSearch={setSearch}
        department={department}
        setDepartment={setDepartment}
        status={status}
        setStatus={setStatus}
        departmentOptions={departmentOptions}
        statusOptions={statusOptions}
      />

      {/* 従業員リスト（カードグリッド） */}
      <Grid container spacing={3}>
        {filtered.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant='h6' color='text.secondary' sx={{ mb: 1 }}>
                {employeesLoading ? '読み込み中…' : '該当する従業員が見つかりませんでした。'}
              </Typography>
              <Typography variant='body2' color='text.disabled'>
                {employeesError ? 'データの取得に失敗しました。時間をおいて再度お試しください。' : '検索条件を変更して、もう一度お試しください。'}
              </Typography>
            </Card>
          </Grid>
        ) : (
          filtered.map(emp => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={emp.id}>
              <EmployeeCard employee={emp} onMenuClick={handleMenuClick} canEdit={isAdmin} />
            </Grid>
          ))
        )}
      </Grid>

      {/* フローティング追加ボタン */}
      {isAdmin ? (
        <Fab color='primary' aria-label='add' sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }} onClick={openAddModal}>
          <AddIcon fontSize='large' />
        </Fab>
      ) : null}

      {/* ドロップダウンメニュー */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={openEditModal} disabled={!isAdmin}>編集</MenuItem>
        <MenuItem onClick={handleDelete} disabled={!isAdmin} sx={{ color: !isAdmin ? undefined : 'error.main' }}>削除</MenuItem>
      </Menu>

      <EmployeeFormDialog
        open={modalOpen}
        onClose={closeModal}
        form={form}
        setForm={setForm}
        roles={roles}
        lines={lines}
        loadingRoles={loadingRoles}
        loadingLines={loadingLines}
        isPasswordShown={isPasswordShown}
        togglePasswordShown={handleClickShowPassword}
        onSave={handleSave}
        employees={employees}
      />
    </>
  )
}

export default EmployeeList
