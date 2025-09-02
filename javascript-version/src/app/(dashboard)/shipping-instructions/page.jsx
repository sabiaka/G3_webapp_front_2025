
'use client'

import { useState } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Fab from '@mui/material/Fab'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Checkbox from '@mui/material/Checkbox'
import InputAdornment from '@mui/material/InputAdornment'
import AddIcon from '@mui/icons-material/Add'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'

// サンプルデータ
const initialInstructions = [
  {
    id: 1,
    title: 'マット 1200x1950x240 sd gm/be 1.9 西川仕様 西川アイロンシール 匠 フラワー ホテル 両面張り 至急対応',
    line: 'マット',
    completed: false,
    remarks: '西川仕様・至急',
    color: 'GM/BE',
    shippingMethod: '匠',
    destination: 'ホテル',
    note: '両面張り',
  },
  {
    id: 2,
    title: 'マット 1200x1950x200 平 gm/be 1.9 路線 グリーン ホテル仕上',
    line: 'マット',
    completed: true,
    remarks: 'グリーン',
    color: 'GM/BE',
    shippingMethod: '路線',
    destination: 'ホテル',
    note: 'ホテル仕上',
  },
  {
    id: 3,
    title: 'サポート 80巾 5col 福岡県小郡 アマゾン アマゾン直送便',
    line: 'ボトム',
    completed: false,
    remarks: 'アマゾン直送',
    color: '',
    shippingMethod: 'アマゾン直送便',
    destination: '福岡県小郡',
    note: '',
  },
  {
    id: 4,
    title: 'ピロー スタンダード white 保証書 路線 サンプル出荷',
    line: 'その他',
    completed: false,
    remarks: 'サンプル出荷',
    color: 'white',
    shippingMethod: '路線',
    destination: '',
    note: '保証書',
  },
]

const lineOptions = [
  { value: 'すべて', label: 'すべて' },
  { value: 'マット', label: 'マット' },
  { value: 'ボトム', label: 'ボトム' },
  { value: 'その他', label: 'その他' },
]

const completedOptions = [
  { value: 'all', label: 'すべて' },
  { value: 'completed', label: '完了' },
  { value: 'not-completed', label: '未完了' },
]

const ShippingInstructionCard = ({ instruction, onToggleComplete, onEdit }) => {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2, opacity: instruction.completed ? 0.6 : 1, position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 220 }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Grid container alignItems='flex-start' justifyContent='space-between'>
          <Grid item>
            <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>{instruction.title}</Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>{instruction.remarks}</Typography>
          </Grid>
          <Grid item>
            <Checkbox
              checked={instruction.completed}
              onChange={() => onToggleComplete(instruction.id)}
              icon={<RadioButtonUncheckedIcon />}
              checkedIcon={<CheckCircleIcon color='primary' />}
              sx={{ p: 0, ml: 1 }}
              inputProps={{ 'aria-label': '完了' }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={1} sx={{ mt: 2 }}>
          <Grid item xs={6} sm={4}><Typography variant='body2'><b>ライン:</b> {instruction.line}</Typography></Grid>
          <Grid item xs={6} sm={4}><Typography variant='body2'><b>色:</b> {instruction.color || '-'}</Typography></Grid>
          <Grid item xs={6} sm={4}><Typography variant='body2'><b>配送方法:</b> {instruction.shippingMethod || '-'}</Typography></Grid>
          <Grid item xs={6} sm={4}><Typography variant='body2'><b>配送先:</b> {instruction.destination || '-'}</Typography></Grid>
          <Grid item xs={6} sm={8}><Typography variant='body2'><b>備考:</b> {instruction.note || '-'}</Typography></Grid>
        </Grid>
      </CardContent>
      <div style={{ padding: 16, background: '#f9fafb', borderBottomLeftRadius: 12, borderBottomRightRadius: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <Button size='small' color='primary' onClick={() => onEdit(instruction)} sx={{ fontWeight: 600 }}>編集</Button>
      </div>
    </Card>
  )
}

const ShippingInstructions = () => {
  const [instructions, setInstructions] = useState(initialInstructions)
  const [search, setSearch] = useState('')
  const [line, setLine] = useState('すべて')
  const [completed, setCompleted] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ id: '', title: '', line: 'マット', completed: false, remarks: '', color: '', shippingMethod: '', destination: '', note: '' })
  const [editMode, setEditMode] = useState(false)

  // フィルタリング
  const filtered = instructions.filter(inst => {
    const textMatch = inst.title.toLowerCase().includes(search.toLowerCase()) || (inst.remarks && inst.remarks.toLowerCase().includes(search.toLowerCase()))
    const lineMatch = line === 'すべて' || inst.line === line
    let completedMatch = true
    if (completed === 'completed') completedMatch = inst.completed
    else if (completed === 'not-completed') completedMatch = !inst.completed
    return textMatch && lineMatch && completedMatch
  })

  // 完了トグル
  const handleToggleComplete = id => {
    setInstructions(prev => prev.map(inst => inst.id === id ? { ...inst, completed: !inst.completed } : inst))
  }

  // 編集
  const handleEdit = inst => {
    setForm(inst)
    setEditMode(true)
    setModalOpen(true)
  }

  // 追加
  const handleAdd = () => {
    setForm({ id: '', title: '', line: 'マット', completed: false, remarks: '', color: '', shippingMethod: '', destination: '', note: '' })
    setEditMode(false)
    setModalOpen(true)
  }

  // 保存
  const handleSave = () => {
    if (!form.title) return
    if (editMode) {
      setInstructions(prev => prev.map(inst => inst.id === form.id ? { ...form } : inst))
    } else {
      const newId = Math.max(...instructions.map(i => i.id), 0) + 1
      setInstructions(prev => [...prev, { ...form, id: newId }])
    }
    setModalOpen(false)
  }

  // 入力変更
  const handleFormChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  return (
    <>
      <Typography variant='h4' sx={{ mb: 4, fontWeight: 700 }}>製造出荷指示</Typography>

      {/* フィルターバー */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 1 }}>
        <CardContent>
          <Grid container spacing={2} alignItems='flex-end'>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label='品名 / 配送先 / 備考で検索'
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
                value={line}
                onChange={e => setLine(e.target.value)}
                displayEmpty
              >
                {lineOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={6} md={2}>
              <Select
                fullWidth
                size='small'
                value={completed}
                onChange={e => setCompleted(e.target.value)}
                displayEmpty
              >
                {completedOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 指示カードリスト */}
      <Grid container spacing={3}>
        {filtered.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant='h6' color='text.secondary' sx={{ mb: 1 }}>該当する指示が見つかりませんでした。</Typography>
              <Typography variant='body2' color='text.disabled'>検索条件を変更して、もう一度お試しください。</Typography>
            </Card>
          </Grid>
        ) : (
          filtered.map(inst => (
            <Grid item xs={12} sm={6} md={4} xl={3} key={inst.id}>
              <ShippingInstructionCard instruction={inst} onToggleComplete={handleToggleComplete} onEdit={handleEdit} />
            </Grid>
          ))
        )}
      </Grid>

      {/* フローティング追加ボタン */}
      <Fab color='primary' aria-label='add' sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }} onClick={handleAdd}>
        <AddIcon fontSize='large' />
      </Fab>

      {/* モーダル（追加・編集） */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>{editMode ? '指示編集' : '新規 製造指示'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField label='指示内容 (品名・仕様など)' name='title' value={form.title} onChange={handleFormChange} fullWidth size='small' sx={{ mb: 2 }} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select label='担当ライン' name='line' value={form.line} onChange={handleFormChange} fullWidth size='small' sx={{ mb: 2 }}>
                {lineOptions.filter(opt => opt.value !== 'すべて').map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label='色' name='color' value={form.color} onChange={handleFormChange} fullWidth size='small' sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label='配送方法' name='shippingMethod' value={form.shippingMethod} onChange={handleFormChange} fullWidth size='small' sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label='配送先' name='destination' value={form.destination} onChange={handleFormChange} fullWidth size='small' sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField label='備考' name='note' value={form.note} onChange={handleFormChange} fullWidth size='small' multiline rows={2} sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField label='特記事項' name='remarks' value={form.remarks} onChange={handleFormChange} fullWidth size='small' sx={{ mb: 2 }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>キャンセル</Button>
          <Button onClick={handleSave} variant='contained'>保存</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ShippingInstructions
