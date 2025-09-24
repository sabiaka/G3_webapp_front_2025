"use client"

import { useMemo, useState } from 'react'

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

function LineItem({ name, onRename, onDelete }) {
	const [editing, setEditing] = useState(false)
	const [draft, setDraft] = useState(name)

	const startEdit = () => {
		setDraft(name)
		setEditing(true)
	}
	const cancelEdit = () => {
		setEditing(false)
		setDraft(name)
	}
	const saveEdit = () => {
		const trimmed = draft.trim()
		if (!trimmed) return cancelEdit()
		if (trimmed === name) return cancelEdit()
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
					<Typography className="text-gray-700">{name}</Typography>
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
	// --- 初期データ（静的） ---
	const [roles, setRoles] = useState([
		{ id: 1, name: '管理画面運用', type: ADMIN },
		{ id: 2, name: '閲覧のみ', type: MEMBER },
	])
	const [newRoleName, setNewRoleName] = useState('')
	const [newRoleType, setNewRoleType] = useState(MEMBER)

	const [lines, setLines] = useState(['Aライン (組立)', 'Bライン (塗装)', '検査ライン'])
	const [newLineName, setNewLineName] = useState('')

	const roleNames = useMemo(() => new Set(roles.map(r => r.name)), [roles])
	const lineNames = useMemo(() => new Set(lines), [lines])

	const addRole = () => {
		const name = newRoleName.trim()
		if (!name || roleNames.has(name)) return
		setRoles(prev => [
			...prev,
			{ id: Math.max(0, ...prev.map(r => r.id)) + 1, name, type: newRoleType },
		])
		setNewRoleName('')
		setNewRoleType(MEMBER)
	}

	const updateRole = updated => {
		// 重複名チェック
		if (roles.some(r => r.id !== updated.id && r.name === updated.name)) return
		setRoles(prev => prev.map(r => (r.id === updated.id ? updated : r)))
	}

	const deleteRole = id => setRoles(prev => prev.filter(r => r.id !== id))

	const addLine = () => {
		const name = newLineName.trim()
		if (!name || lineNames.has(name)) return
		setLines(prev => [...prev, name])
		setNewLineName('')
	}

	const renameLine = (index, newName) => {
		if (!newName || lineNames.has(newName)) return
		setLines(prev => prev.map((l, i) => (i === index ? newName : l)))
	}

	const deleteLine = index => {
		setLines(prev => prev.filter((_, i) => i !== index))
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
								{lines.map((line, idx) => (
									<LineItem
										key={`${line}-${idx}`}
										name={line}
										onRename={newName => renameLine(idx, newName)}
										onDelete={() => deleteLine(idx)}
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
		</Box>
	)
}

