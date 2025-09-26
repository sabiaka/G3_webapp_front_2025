"use client"

import { useEffect, useMemo, useState, useCallback } from 'react'

// MUI Components
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

// MUI Icons
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import PrecisionManufacturingOutlinedIcon from '@mui/icons-material/PrecisionManufacturingOutlined'

// 型の簡易表現
const ADMIN = '管理者'
const MEMBER = '一般従業員'

// API ヘルパー
function getToken() {
	if (typeof window === 'undefined') return null
	try {
		return (
			window.localStorage.getItem('access_token') ||
			window.sessionStorage.getItem('access_token') ||
			null
		)
	} catch {
		return null
	}
}

async function api(path, { method = 'GET', body, headers } = {}) {
	const token = getToken()
	const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
	const res = await fetch(`${base}${path}`, {
		method,
		headers: {
			...(body ? { 'Content-Type': 'application/json' } : {}),
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...headers,
		},
		body: body ? JSON.stringify(body) : undefined,
	})

	if (!res.ok) {
		let payload = null
		try {
			payload = await res.json()
		} catch {
			try {
				payload = await res.text()
			} catch {
				payload = null
			}
		}
		const err = new Error('Request failed')
		err.status = res.status
		err.payload = payload
		throw err
	}

	if (res.status === 204) return null
	return res.json()
}

function RoleItem({ role, onUpdate, onDelete }) {
	const [editing, setEditing] = useState(false)
	const [nameDraft, setNameDraft] = useState(role.name)

	const isAdmin = role.type === ADMIN

	const handleToggleType = () => {
		const nextType = isAdmin ? MEMBER : ADMIN
		onUpdate({ ...role, type: nextType })
	}

	const startEdit = () => {
		setNameDraft(role.name)
		setEditing(true)
	}

	const cancelEdit = () => {
		setEditing(false)
		setNameDraft(role.name)
	}

	const saveEdit = () => {
		const trimmed = nameDraft.trim()
		if (!trimmed) return cancelEdit()
		if (trimmed === role.name) return cancelEdit()
		onUpdate({ ...role, name: trimmed })
		setEditing(false)
	}

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				bgcolor: 'action.hover',
				borderRadius: 1,
				p: 1.5,
			}}
		>
			<Stack direction="row" spacing={1.5} alignItems="center">
				<Avatar variant="rounded" sx={{ bgcolor: 'background.paper', color: 'text.secondary', boxShadow: 0 }}>
					<ShieldOutlinedIcon fontSize="small" />
				</Avatar>

				{!editing ? (
					<Typography className="text-gray-800" fontWeight={600}>
						{role.name}
					</Typography>
				) : (
					<TextField
						size="small"
						value={nameDraft}
						onChange={e => setNameDraft(e.target.value)}
						onKeyDown={e => {
							if (e.key === 'Enter') saveEdit()
							if (e.key === 'Escape') cancelEdit()
						}}
						onBlur={cancelEdit}
						placeholder="ロール名"
					/>
				)}
			</Stack>

			<Stack direction="row" spacing={1.5} alignItems="center">
				{!editing && (
					<Button
						onClick={handleToggleType}
						size="small"
						variant="outlined"
						color={isAdmin ? 'primary' : 'inherit'}
						startIcon={isAdmin ? <AdminPanelSettingsOutlinedIcon /> : <PersonOutlineOutlinedIcon />}
						sx={{ minWidth: 120 }}
					>
						{isAdmin ? ADMIN : MEMBER}
					</Button>
				)}

				{!editing ? (
					<Stack direction="row" spacing={0.5}>
						<IconButton size="small" color="default" onClick={startEdit}>
							<EditOutlinedIcon fontSize="small" />
						</IconButton>
						<IconButton size="small" color="error" onClick={onDelete}>
							<DeleteOutlineOutlinedIcon fontSize="small" />
						</IconButton>
					</Stack>
				) : (
					<Stack direction="row" spacing={0.5}>
						<IconButton size="small" color="success" onClick={saveEdit}>
							<CheckOutlinedIcon fontSize="small" />
						</IconButton>
						<IconButton size="small" color="error" onClick={cancelEdit}>
							<CloseOutlinedIcon fontSize="small" />
						</IconButton>
					</Stack>
				)}
			</Stack>
		</Box>
	)
}

function LineItem({ line, onRename, onDelete }) {
	const [editing, setEditing] = useState(false)
	const [draft, setDraft] = useState(line.name)

	const startEdit = () => {
		setDraft(line.name)
		setEditing(true)
	}
	const cancelEdit = () => {
		setEditing(false)
		setDraft(line.name)
	}
	const saveEdit = () => {
		const trimmed = draft.trim()
		if (!trimmed) return cancelEdit()
		if (trimmed === line.name) return cancelEdit()
		onRename(trimmed)
		setEditing(false)
	}

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				bgcolor: 'action.hover',
				borderRadius: 1,
				p: 1.5,
			}}
		>
			<Stack direction="row" spacing={1.5} alignItems="center">
				<Avatar variant="rounded" sx={{ bgcolor: 'background.paper', color: 'text.secondary', boxShadow: 0 }}>
					<PrecisionManufacturingOutlinedIcon fontSize="small" />
				</Avatar>
				{!editing ? (
					<Typography className="text-gray-700">{line.name}</Typography>
				) : (
					<TextField
						size="small"
						value={draft}
						onChange={e => setDraft(e.target.value)}
						onKeyDown={e => {
							if (e.key === 'Enter') saveEdit()
							if (e.key === 'Escape') cancelEdit()
						}}
						onBlur={cancelEdit}
						placeholder="ライン名"
					/>
				)}
			</Stack>

			{!editing ? (
				<Stack direction="row" spacing={0.5}>
					<IconButton size="small" color="default" onClick={startEdit}>
						<EditOutlinedIcon fontSize="small" />
					</IconButton>
					<IconButton size="small" color="error" onClick={onDelete}>
						<DeleteOutlineOutlinedIcon fontSize="small" />
					</IconButton>
				</Stack>
			) : (
				<Stack direction="row" spacing={0.5}>
					<IconButton size="small" color="success" onClick={saveEdit}>
						<CheckOutlinedIcon fontSize="small" />
					</IconButton>
					<IconButton size="small" color="error" onClick={cancelEdit}>
						<CloseOutlinedIcon fontSize="small" />
					</IconButton>
				</Stack>
			)}
		</Box>
	)
}

export default function FactorySettingsPage() {
	// --- ステート ---
	const [roles, setRoles] = useState([])
	const [newRoleName, setNewRoleName] = useState('')
	const [newRoleType, setNewRoleType] = useState(MEMBER)
	const [rolesLoading, setRolesLoading] = useState(false)

	const [lines, setLines] = useState([]) // { id, name }
	const [newLineName, setNewLineName] = useState('')
	const [linesLoading, setLinesLoading] = useState(false)

	const [snack, setSnack] = useState({ open: false, severity: 'info', message: '' })
	const openSnack = useCallback((message, severity = 'info') => setSnack({ open: true, message, severity }), [])
	const closeSnack = useCallback(() => setSnack(s => ({ ...s, open: false })), [])

	const roleNames = useMemo(() => new Set(roles.map(r => r.name)), [roles])
	const lineNames = useMemo(() => new Set(lines.map(l => l.name)), [lines])

	// --- 初期ロード ---
	useEffect(() => {
		;(async () => {
			setRolesLoading(true)
			try {
				const data = await api('/api/roles')
				setRoles(
					(Array.isArray(data) ? data : []).map(r => ({ id: r.role_id, name: r.role_name, type: r.is_admin ? ADMIN : MEMBER }))
				)
			} catch (e) {
				openSnack(`権限一覧の取得に失敗しました (${e.status || ''})`, 'error')
			} finally {
				setRolesLoading(false)
			}
		})()

		;(async () => {
			setLinesLoading(true)
			try {
				const data = await api('/api/lines')
				setLines((Array.isArray(data) ? data : []).map(l => ({ id: l.line_id, name: l.line_name })))
			} catch (e) {
				openSnack(`ライン一覧の取得に失敗しました (${e.status || ''})`, 'error')
			} finally {
				setLinesLoading(false)
			}
		})()
	}, [openSnack])

	// --- 役割 CRUD ---
	const addRole = async () => {
		const name = newRoleName.trim()
		if (!name) return
		if (roleNames.has(name)) {
			openSnack('同じロール名が既に存在します', 'warning')
			return
		}
		try {
			const created = await api('/api/roles', {
				method: 'POST',
				body: { role_name: name, is_admin: newRoleType === ADMIN },
			})
			setRoles(prev => [...prev, { id: created.role_id, name: created.role_name, type: created.is_admin ? ADMIN : MEMBER }])
			setNewRoleName('')
			setNewRoleType(MEMBER)
			openSnack('ロールを追加しました', 'success')
		} catch (e) {
			if (e.status === 409) openSnack('ロール名が重複しています', 'warning')
			else openSnack('ロールの追加に失敗しました', 'error')
		}
	}

	const updateRole = async updated => {
		const original = roles.find(r => r.id === updated.id)
		if (!original) return
		const body = {}
		if (updated.name !== original.name) body.role_name = updated.name
		if (updated.type !== original.type) body.is_admin = updated.type === ADMIN
		if (Object.keys(body).length === 0) return
		try {
			const res = await api(`/api/roles/${updated.id}`, { method: 'PUT', body })
			const mapped = { id: res.role_id, name: res.role_name, type: res.is_admin ? ADMIN : MEMBER }
			setRoles(prev => prev.map(r => (r.id === mapped.id ? mapped : r)))
			openSnack('ロールを更新しました', 'success')
		} catch (e) {
			if (e.status === 404) openSnack('対象のロールが見つかりません', 'warning')
			else if (e.status === 409) openSnack('ロール名が重複しています', 'warning')
			else openSnack('ロールの更新に失敗しました', 'error')
		}
	}

	const deleteRole = async id => {
		try {
			await api(`/api/roles/${id}`, { method: 'DELETE' })
			setRoles(prev => prev.filter(r => r.id !== id))
			openSnack('ロールを削除しました', 'success')
		} catch (e) {
			if (e.status === 409) openSnack('関連データがあり削除できません', 'warning')
			else openSnack('ロールの削除に失敗しました', 'error')
		}
	}

	// --- ライン CRUD ---
	const addLine = async () => {
		const name = newLineName.trim()
		if (!name) return
		if (lineNames.has(name)) {
			openSnack('同じライン名が既に存在します', 'warning')
			return
		}
		try {
			const created = await api('/api/lines', { method: 'POST', body: { line_name: name } })
			setLines(prev => [...prev, { id: created.line_id, name: created.line_name }])
			setNewLineName('')
			openSnack('ラインを追加しました', 'success')
		} catch (e) {
			if (e.status === 409) openSnack('ライン名が重複しています', 'warning')
			else openSnack('ラインの追加に失敗しました', 'error')
		}
	}

	const renameLine = async (id, newName) => {
		if (!newName) return
		if (lineNames.has(newName)) {
			openSnack('同じライン名が既に存在します', 'warning')
			return
		}
		try {
			const res = await api(`/api/lines/${id}`, { method: 'PUT', body: { line_name: newName } })
			setLines(prev => prev.map(l => (l.id === id ? { id: res.line_id, name: res.line_name } : l)))
			openSnack('ライン名を更新しました', 'success')
		} catch (e) {
			if (e.status === 404) openSnack('対象のラインが見つかりません', 'warning')
			else if (e.status === 409) openSnack('ライン名が重複しています', 'warning')
			else openSnack('ライン名の更新に失敗しました', 'error')
		}
	}

	const deleteLine = async id => {
		try {
			await api(`/api/lines/${id}`, { method: 'DELETE' })
			setLines(prev => prev.filter(l => l.id !== id))
			openSnack('ラインを削除しました', 'success')
		} catch (e) {
			openSnack('ラインの削除に失敗しました', 'error')
		}
	}

	return (
		<Box className="container mx-auto p-4 sm:p-6 lg:p-8">
			<Grid container spacing={6}>
				{/* 権限種別管理 */}
				<Grid item xs={12} md={6}>
					<Card>
						<CardHeader
											avatar={
												<Avatar sx={theme => ({ bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText })}>
													<AdminPanelSettingsOutlinedIcon />
												</Avatar>
											}
							title={<Typography fontWeight={700}>権限種別管理</Typography>}
						/>
						<Divider />
						<CardContent>
							<Stack spacing={1.25}>
								{roles.map(role => (
									<RoleItem
										key={role.id}
										role={role}
										onUpdate={updateRole}
										onDelete={() => deleteRole(role.id)}
									/>
								))}
							</Stack>

											<Stack
												direction="row"
												spacing={1.5}
												mt={3}
												alignItems="center"
												sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}
											>
												<TextField
													size="small"
													label="ロール名を入力"
													placeholder="例: 閲覧のみ"
													value={newRoleName}
													onChange={e => setNewRoleName(e.target.value)}
													onKeyDown={e => {
														if (e.key === 'Enter') addRole()
													}}
													sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 240 } }}
												/>
												<Button
													variant="outlined"
													color={newRoleType === ADMIN ? 'primary' : 'inherit'}
													startIcon={newRoleType === ADMIN ? <AdminPanelSettingsOutlinedIcon /> : <PersonOutlineOutlinedIcon />}
													onClick={() => setNewRoleType(prev => (prev === ADMIN ? MEMBER : ADMIN))}
													sx={{ minWidth: { xs: '100%', sm: 140 }, flexShrink: 0, whiteSpace: 'nowrap' }}
												>
													{newRoleType}
												</Button>
												<Button variant="contained" onClick={addRole} sx={{ minWidth: { xs: '100%', sm: 96 }, flexShrink: 0, whiteSpace: 'nowrap' }}>
													追加
												</Button>
											</Stack>
						</CardContent>
					</Card>
				</Grid>

				{/* 工場ライン管理 */}
				<Grid item xs={12} md={6}>
					<Card>
						<CardHeader
											avatar={
												<Avatar sx={theme => ({ bgcolor: theme.palette.success.main, color: theme.palette.success.contrastText })}>
													<PrecisionManufacturingOutlinedIcon />
												</Avatar>
											}
							title={<Typography fontWeight={700}>工場ライン管理</Typography>}
						/>
						<Divider />
						<CardContent>
							<Stack spacing={1.25}>
								{lines.map((line) => (
									<LineItem
										key={line.id}
										line={line}
										onRename={newName => renameLine(line.id, newName)}
										onDelete={() => deleteLine(line.id)}
									/>
								))}
							</Stack>

											<Stack
												direction="row"
												spacing={1.5}
												mt={3}
												alignItems="center"
												sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}
											>
												<TextField
													size="small"
													label="新しいライン名"
													placeholder="例: Cライン"
													value={newLineName}
													onChange={e => setNewLineName(e.target.value)}
													onKeyDown={e => {
														if (e.key === 'Enter') addLine()
													}}
													sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 240 } }}
												/>
												<Button variant="contained" onClick={addLine} sx={{ minWidth: { xs: '100%', sm: 96 }, flexShrink: 0, whiteSpace: 'nowrap' }}>
													追加
												</Button>
											</Stack>
						</CardContent>
					</Card>
				</Grid>
			</Grid>

				<Snackbar open={snack.open} autoHideDuration={3000} onClose={closeSnack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
					<Alert onClose={closeSnack} severity={snack.severity} sx={{ width: '100%' }}>
						{snack.message}
					</Alert>
				</Snackbar>
		</Box>
	)
}

