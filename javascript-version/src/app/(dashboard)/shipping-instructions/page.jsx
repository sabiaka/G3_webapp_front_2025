'use client'

import { useState } from 'react'
import confetti from 'canvas-confetti'

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
import Checkbox from '@mui/material/Checkbox'
import InputAdornment from '@mui/material/InputAdornment'
import AddIcon from '@mui/icons-material/Add'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SquareFootIcon from '@mui/icons-material/SquareFoot'
import PaletteIcon from '@mui/icons-material/Palette'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import PlaceIcon from '@mui/icons-material/Place'
import EventIcon from '@mui/icons-material/Event'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import NotesIcon from '@mui/icons-material/Notes'
import SvgIcon from '@mui/material/SvgIcon'
import CategoryIcon from '@mui/icons-material/Category'
import NumbersIcon from '@mui/icons-material/Numbers'

// 縦向きのギザギザ線アイコン（コイル/バネ風）
const SpringIcon = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M7 4 L11 8 L7 12 L11 16 L7 20'
      stroke='currentColor'
      strokeWidth='2'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M17 4 L13 8 L17 12 L13 16 L17 20'
      stroke='currentColor'
      strokeWidth='2'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </SvgIcon>
)

// データ: サンプル初期値とセレクトオプションを外部から読み込み
import { initialInstructions, lineOptions, completedOptions } from './data/sampleInitialInstructions'

// APIの新しい仕様に合わせてデータを正規化するヘルパー
function normalizeInstruction(apiItem) {
  // 元のフィールドと新仕様のフィールドのどちらにも対応する
  const id = apiItem.id
  const line = apiItem.line || apiItem.line_name || 'その他'

  // title は product_name と size を結合して作る。両方なければ既存の title を使う
  const productName = apiItem.product_name || apiItem.title || ''
  const size = apiItem.size || apiItem.spec || ''
  const title = [productName, size].filter(Boolean).join(' ').trim() || productName || apiItem.title || ''

  // 新仕様の個別フィールドも保持（カードで表示するため）
  const productNameField = productName
  const sizeField = size
  const springType = apiItem.spring_type || apiItem.springType || null
  const includedItems = apiItem.included_items || apiItem.includedItems || null

  // completed フラグの統一
  const completed = typeof apiItem.is_completed === 'boolean' ? apiItem.is_completed : (apiItem.completed === true)

  // フィールド名マッピング
  const color = apiItem.color || ''
  const shippingMethod = apiItem.shipping_method || apiItem.shippingMethod || apiItem.shippingMethodName || ''
  const destination = apiItem.destination || ''
  const remarks = apiItem.remarks || ''
  const note = apiItem.included_items || apiItem.note || ''
  const quantity = typeof apiItem.quantity === 'number' ? apiItem.quantity : (apiItem.qty ? Number(apiItem.qty) : (apiItem.quantity || 0))
  const createdAt = apiItem.created_at || apiItem.createdAt || null

  return { id, line, title, completed, color, shippingMethod, destination, remarks, note, quantity, createdAt, productName: productNameField, size: sizeField, springType, includedItems }
}

// タイトル分割用: 先頭のライン名(例: "マット")と残りの内容を分ける
function splitTitle(title, line) {
  if (!title) return { main: line, sub: '' }

  if (title.startsWith(line)) {
    return { main: line, sub: title.slice(line.length).trim() }
  }


  // マッチしない場合は、lineをメイン、title全体をサブとして扱う
  return { main: line, sub: title }
}

const cardMinHeight = 260

// ライン別の差し色
const lineAccent = {
  'マット': '#06b6d4', // cyan-500
  'ボトム': '#f97316', // orange-500
  'その他': '#9ca3af'  // gray-400
}

const LineChip = ({ line }) => {
  const chipStyles = {
    'マット': { backgroundColor: '#cffafe', color: '#0e7490' },
    'ボトム': { backgroundColor: '#ffedd5', color: '#9a3412' },
    'その他': { backgroundColor: '#e5e7eb', color: '#374151' },
  }

  
return <span className='px-3 py-1 text-sm font-semibold rounded-full' style={chipStyles[line] || chipStyles['その他']}>{line}</span>
}


const ShippingInstructionCard = ({ instruction, onToggleComplete, onEdit }) => {
  const { main, sub } = splitTitle(instruction.title, instruction.line);

  // カード全体クリックで完了トグル（Enter/Spaceでも可）
  const handleCardClick = (e) => onToggleComplete(instruction.id, e && e.clientX, e && e.clientY)
  const handleKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      // キーボード操作時はマウス座標がないため undefined を渡す
      onToggleComplete(instruction.id)
    }
  }

return (
    <Card
      className='fade-in'
      sx={{
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        // 完了/未完了の見た目差分（完了は緑基調）
        opacity: instruction.completed ? 0.95 : 1,
        border: instruction.completed ? '1px solid #86efac' : '1px solid #e5e7eb',
        backgroundColor: instruction.completed ? '#f0fdf4' : '#ffffff',
        minHeight: cardMinHeight,
        height: '100%',
        width: '100%',
        minWidth: 0, // flex 子要素のはみ出し防止（内容で横幅が伸びないように）
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s',
        position: 'relative',
        cursor: 'pointer',
        // 左側差し色バー
        '&:before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '6px',
          borderTopLeftRadius: '12px',
          borderBottomLeftRadius: '12px',
          backgroundColor: instruction.completed ? '#22c55e' : (lineAccent[instruction.line] || lineAccent['その他'])
        },
        '&:hover': {
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          transform: 'translateY(-4px)'
        }
      }}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role='button'
      tabIndex={0}
    >
      {/* 完了時の大きなチェック透かし */}
      {instruction.completed && (
        <div className='absolute inset-0 pointer-events-none flex items-center justify-center'>
          <CheckCircleIcon sx={{ fontSize: 140, color: 'rgba(34,197,94,0.12)' }} />
        </div>
      )}
      {/* 上部: ヘッダー */}
      <div className='p-5 border-b border-gray-200 flex justify-between items-start'>
        <div>
          <LineChip line={instruction.line} />
          <Typography
            variant='h3'
            sx={{
              fontWeight: 800,
              fontSize: 20,
              color: '#111827',
              mt: 1.5,
              lineHeight: 1.3,
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              textDecoration: instruction.completed ? 'line-through' : 'none'
            }}
          >
            {instruction.productName || main}
            <Typography component="span" sx={{ fontSize: 15, color: '#4b5563', fontWeight: 500, display: 'block', mt: 0.5, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
              {instruction.size || sub}
            </Typography>
          </Typography>
        </div>
        <div className='text-right flex-shrink-0 flex items-start gap-3'>
          {/* ステータス表示ピル */}
          <span
            className='px-2.5 py-1 rounded-full text-xs font-bold select-none'
            style={{
              backgroundColor: instruction.completed ? '#dcfce7' : '#f3f4f6',
              color: instruction.completed ? '#166534' : '#374151',
              border: instruction.completed ? '1px solid #86efac' : '1px solid #e5e7eb'
            }}
          >
            {instruction.completed ? '完了' : '未完了'}
          </span>

          {/* チェックボックス（クリックの伝播停止） */}
          <Checkbox
            checked={instruction.completed}
            // クリック時に座標を渡して toggle
            onClick={e => { e.stopPropagation(); onToggleComplete(instruction.id, e.clientX, e.clientY) }}
            // onChange は noop にしておく（状態は親が更新する）
            onChange={() => {}}
            icon={<RadioButtonUncheckedIcon />}
            checkedIcon={<CheckCircleIcon />}
            sx={{ p: 0, '&.Mui-checked': { color: '#16a34a' } }}
            inputProps={{ 'aria-label': '完了' }}
          />
        </div>
      </div>

      {/* 中央: 詳細 */}
      <div
        className='p-5 flex-grow space-y-3 text-sm'
        style={{ textDecoration: instruction.completed ? 'line-through' : 'none' }}
      >
    <div>
      <h4 className="font-bold text-gray-500 mb-1.5 text-xs uppercase tracking-wider">仕様</h4>
      <div className="space-y-1 text-gray-700">
                <div className="flex items-center"><PaletteIcon sx={{ mr: 1, color: '#6b7280', fontSize: 18 }} /><p className="w-20 text-gray-500 shrink-0">カラー:</p><p className="font-medium">{instruction.color || '-'}</p></div>
                <div className="flex items-center"><SquareFootIcon sx={{ mr: 1, color: '#6b7280', fontSize: 18 }} /><p className="w-20 text-gray-500 shrink-0">サイズ:</p><p className="font-medium">{instruction.size || '-'}</p></div>
                <div className="flex items-center"><SpringIcon sx={{ mr: 1, color: '#6b7280', fontSize: 18 }} /><p className="w-20 text-gray-500 shrink-0">スプリング:</p><p className="font-medium">{instruction.springType || '-'}</p></div>
                <div className="flex items-center"><Inventory2Icon sx={{ mr: 1, color: '#6b7280', fontSize: 18 }} /><p className="w-20 text-gray-500 shrink-0">同梱物:</p><p className="font-medium">{instruction.includedItems || instruction.note || '-'}</p></div>
                <div className="flex items-center"><NotesIcon sx={{ mr: 1, color: '#6b7280', fontSize: 18 }} /><p className="w-20 text-gray-500 shrink-0">備考:</p><p className="font-medium">{instruction.remarks || '-'}</p></div>
      </div>
    </div>
         <div>
            <h4 className="font-bold text-gray-500 mb-1.5 text-xs uppercase tracking-wider">配送情報</h4>
            <div className="space-y-1 text-gray-700">
        <div className="flex items-center"><LocalShippingIcon sx={{ mr: 1, color: '#6b7280', fontSize: 18 }} /><p className="w-20 text-gray-500 shrink-0">配送方法:</p><p className="font-medium">{instruction.shippingMethod || '-'}</p></div>
        <div className="flex items-center"><PlaceIcon sx={{ mr: 1, color: '#6b7280', fontSize: 18 }} /><p className="w-20 text-gray-500 shrink-0">配送先:</p><p className="font-medium">{instruction.destination || '-'}</p></div>
        {instruction.remarks && <div className="flex items-center"><EventIcon sx={{ mr: 1, color: '#ef4444', fontSize: 18 }} /><p className="w-20 text-gray-500 shrink-0">特記:</p><p className="font-bold text-red-600">{instruction.remarks}</p></div>}
        {instruction.createdAt && (
          <div className="flex items-center text-sm text-gray-500"><EventIcon sx={{ mr: 1, fontSize: 18 }} />{new Date(instruction.createdAt).toLocaleString()}</div>
        )}
            </div>
        </div>
      </div>

      {/* 下部: フッター */}
      <div className='p-4 bg-gray-50 rounded-b-xl flex justify-between items-center'>
        {/* 左下 数量表示（画像のテイスト） */}
        <div style={{ display: 'flex', alignItems: 'center', textDecoration: instruction.completed ? 'line-through' : 'none' }}>
          <span style={{
            marginLeft: 8,
            color: '#9ca3af',
            fontSize: 12,
            fontWeight: 700,
            lineHeight: 1
          }}>数量:</span>
          <span style={{
            marginLeft: 5,
            marginBottom: 3,
            color: instruction.completed ? '#16a34a' : '#4f46e5',
            fontSize: 25,
            fontWeight: 800,
          }}>{instruction.quantity ?? '-'}</span>
        </div>
        <Button 
          variant="text" 
          size='small' 
          onClick={(e) => { e.stopPropagation(); onEdit(instruction) }} 
          startIcon={<EditOutlinedIcon />}
          sx={{ color: '#4f46e5', fontWeight: 600 }}
        >
          編集
        </Button>
      </div>
    </Card>
  )
}

const ShippingInstructions = () => {
  // 初期データを正規化して内部で使う形にする
  const [instructions, setInstructions] = useState(() => initialInstructions.map(normalizeInstruction))
  const [search, setSearch] = useState('')
  const [line, setLine] = useState('すべて')
  const [completed, setCompleted] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ id: '', productName: '', size: '', title: '', line: 'マット', completed: false, remarks: '', color: '', shippingMethod: '', destination: '', includedItems: '', springType: '', quantity: 1 })
  const [editMode, setEditMode] = useState(false)

  // フィルタリング
  const filtered = instructions.filter(inst => {
    // 検索テキストのマッチング
    const searchText = search.toLowerCase()

    const textMatch = !searchText ||
      inst.title.toLowerCase().includes(searchText) ||
      (inst.destination && inst.destination.toLowerCase().includes(searchText)) ||
      (inst.remarks && inst.remarks.toLowerCase().includes(searchText)) ||
      (inst.note && inst.note.toLowerCase().includes(searchText))

    // ラインのマッチング
    const lineMatch = line === 'すべて' || inst.line === line

    // 完了状態のマッチング
    let completedMatch = true

    if (completed === 'completed') completedMatch = inst.completed
    else if (completed === 'not-completed') completedMatch = !inst.completed
    
    return textMatch && lineMatch && completedMatch
  })

  // 完了トグル（未完了->完了 は即時：紙吹雪、完了->未完了 は確認ダイアログ）
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingToggleId, setPendingToggleId] = useState(null)

  const handleToggleComplete = (id, clientX, clientY) => {
    const target = instructions.find(i => i.id === id)
    if (!target) return

    if (!target.completed) {
      // 未完了 -> 完了: 即時変更 + 紙吹雪
      setInstructions(prev => prev.map(inst => inst.id === id ? { ...inst, completed: true } : inst))
      // クリック座標が渡されたらその位置を起点に発射する
      let originX = 0.5
      let originY = 0.2
      if (typeof clientX === 'number' && typeof clientY === 'number') {
        originX = Math.min(Math.max(clientX / window.innerWidth, 0), 1)
        originY = Math.min(Math.max(clientY / window.innerHeight, 0), 1)
      }
      try {
        confetti({ particleCount: 150, spread: 80, origin: { x: originX, y: originY } })
      } catch (err) {
        // confetti が読み込めなくても動作は阻害しない
        console.warn('confetti failed', err)
      }
    } else {
      // 完了 -> 未完了: 確認ダイアログを開く
      setPendingToggleId(id)
      setConfirmOpen(true)
    }
  }

  const confirmRevert = () => {
    if (pendingToggleId == null) return
    setInstructions(prev => prev.map(inst => inst.id === pendingToggleId ? { ...inst, completed: false } : inst))
    setPendingToggleId(null)
    setConfirmOpen(false)
  }

  const cancelRevert = () => {
    setPendingToggleId(null)
    setConfirmOpen(false)
  }

  // 編集
  const handleEdit = inst => {
    setForm(inst)
    setEditMode(true)
    setModalOpen(true)
  }

  // 追加
  const handleAdd = () => {
  setForm({ id: '', productName: '', size: '', title: '', line: 'マット', completed: false, remarks: '', color: '', shippingMethod: '', destination: '', includedItems: '', springType: '', quantity: 1 })
    setEditMode(false)
    setModalOpen(true)
  }

  // 保存
  const handleSave = () => {
    // 必須: productName (もしくは title の互換)
    if (!form.productName && !form.title) return

    // 作成時は title を productName + size で組み立てる
    const computedTitle = form.productName ? ([form.productName, form.size].filter(Boolean).join(' ').trim()) : form.title

    const toSave = {
      ...form,
      title: computedTitle,
      productName: form.productName,
      size: form.size,
      springType: form.springType || null,
      includedItems: form.includedItems || form.note || null,
      shippingMethod: form.shippingMethod || null,
      quantity: typeof form.quantity === 'number' ? form.quantity : Number(form.quantity || 0),
      createdAt: form.createdAt || new Date().toISOString()
    }

    if (editMode) {
      setInstructions(prev => prev.map(inst => inst.id === form.id ? { ...inst, ...toSave } : inst))
    } else {
      const newId = Math.max(...instructions.map(i => i.id), 0) + 1
      setInstructions(prev => [...prev, { ...toSave, id: newId }])
    }

    setModalOpen(false)
  }

  // 入力変更
  const handleFormChange = e => {
    const { name, value } = e.target

    // 数値入力は number に変換
    if (name === 'quantity') {
      setForm(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }))
      return
    }

    setForm(prev => ({ ...prev, [name]: value }))
  }

  // ここから描画

  return (
    <>
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
      <Grid container spacing={3} alignItems='stretch'>
        {filtered.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant='h6' color='text.secondary' sx={{ mb: 1 }}>該当する指示が見つかりませんでした。</Typography>
              <Typography variant='body2' color='text.disabled'>検索条件を変更して、もう一度お試しください。</Typography>
            </Card>
          </Grid>
        ) : (
          filtered.map(inst => (
            <Grid item xs={12} sm={6} md={4} xl={3} key={inst.id} sx={{ display: 'flex' }}>
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
              <TextField 
                label='品名' 
                name='productName' 
                value={form.productName} 
                onChange={handleFormChange} 
                fullWidth 
                size='small' 
                sx={{ mb: 2 }} 
                required 
                InputProps={{ startAdornment: (<InputAdornment position='start'><CategoryIcon fontSize='small' /></InputAdornment>) }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label='サイズ' 
                name='size' 
                value={form.size} 
                onChange={handleFormChange} 
                fullWidth 
                size='small' 
                sx={{ mb: 2 }} 
                InputProps={{ startAdornment: (<InputAdornment position='start'><SquareFootIcon fontSize='small' /></InputAdornment>) }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select label='担当ライン' name='line' value={form.line} onChange={handleFormChange} fullWidth size='small' sx={{ mb: 2 }}>
                {lineOptions.filter(opt => opt.value !== 'すべて').map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField 
                label='スプリング種別' 
                name='springType' 
                value={form.springType} 
                onChange={handleFormChange} 
                fullWidth 
                size='small' 
                sx={{ mb: 2 }} 
                InputProps={{ startAdornment: (<InputAdornment position='start'><SpringIcon sx={{ fontSize: 18 }} /></InputAdornment>) }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label='同梱物' 
                name='includedItems' 
                value={form.includedItems} 
                onChange={handleFormChange} 
                fullWidth 
                size='small' 
                sx={{ mb: 2 }} 
                InputProps={{ startAdornment: (<InputAdornment position='start'><Inventory2Icon fontSize='small' /></InputAdornment>) }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField 
                label='数量' 
                name='quantity' 
                type='number' 
                inputProps={{ min: 1 }} 
                value={form.quantity} 
                onChange={handleFormChange} 
                fullWidth 
                size='small' 
                sx={{ mb: 2 }} 
                InputProps={{ startAdornment: (<InputAdornment position='start'><NumbersIcon fontSize='small' /></InputAdornment>) }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label='色' 
                name='color' 
                value={form.color} 
                onChange={handleFormChange} 
                fullWidth 
                size='small' 
                sx={{ mb: 2 }} 
                InputProps={{ startAdornment: (<InputAdornment position='start'><PaletteIcon fontSize='small' /></InputAdornment>) }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField 
                label='配送方法' 
                name='shippingMethod' 
                value={form.shippingMethod} 
                onChange={handleFormChange} 
                fullWidth 
                size='small' 
                sx={{ mb: 2 }} 
                InputProps={{ startAdornment: (<InputAdornment position='start'><LocalShippingIcon fontSize='small' /></InputAdornment>) }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label='配送先' 
                name='destination' 
                value={form.destination} 
                onChange={handleFormChange} 
                fullWidth 
                size='small' 
                sx={{ mb: 2 }} 
                InputProps={{ startAdornment: (<InputAdornment position='start'><PlaceIcon fontSize='small' /></InputAdornment>) }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField 
                label='備考' 
                name='remarks' 
                value={form.remarks} 
                onChange={handleFormChange} 
                fullWidth 
                size='small' 
                multiline 
                rows={2} 
                sx={{ mb: 2 }} 
                InputProps={{ startAdornment: (<InputAdornment position='start'><NotesIcon fontSize='small' /></InputAdornment>) }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>キャンセル</Button>
          <Button onClick={handleSave} variant='contained'>保存</Button>
        </DialogActions>
      </Dialog>
      {/* 完了 -> 未完了 に戻す確認ダイアログ */}
      <Dialog open={confirmOpen} onClose={cancelRevert}>
        <DialogTitle>完了を取り消しますか？</DialogTitle>
        <DialogContent>
          <Typography>この指示を未完了に戻しますか？</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelRevert}>キャンセル</Button>
          <Button onClick={confirmRevert} variant='contained'>未完了に戻す</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ShippingInstructions

