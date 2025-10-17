"use client"
// カードのコンポーネント

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import SquareFootIcon from '@mui/icons-material/SquareFoot'
import PaletteIcon from '@mui/icons-material/Palette'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import PlaceIcon from '@mui/icons-material/Place'
import EventIcon from '@mui/icons-material/Event'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import NotesIcon from '@mui/icons-material/Notes'
import useAuthMe from '@core/hooks/useAuthMe'

import SpringIcon from './icons/SpringIcon'

const cardMinHeight = 260

const lineAccent = {
  'マット': '#06b6d4',
  'ボトム': '#f97316',
  'その他': '#9ca3af'
}

const LineChip = ({ line }) => {
  const chipStyles = {
    'マット': { backgroundColor: '#cffafe', color: '#0e7490' },
    'ボトム': { backgroundColor: '#ffedd5', color: '#9a3412' },
    'その他': { backgroundColor: '#e5e7eb', color: '#374151' },
  }

  return <span className='px-3 py-1 text-sm font-semibold rounded-full' style={chipStyles[line] || chipStyles['その他']}>{line}</span>
}

function splitTitle(title, line) {
  if (!title) return { main: line, sub: '' }
  if (title.startsWith(line)) {
    return { main: line, sub: title.slice(line.length).trim() }
  }
  return { main: line, sub: title }
}

const ShippingInstructionCard = ({ instruction, onToggleComplete, onEdit, onDelete }) => {
  const { isAdmin } = useAuthMe()
  const { main, sub } = splitTitle(instruction.title, instruction.line)

  const handleCardClick = e => onToggleComplete(instruction.id, e && e.clientX, e && e.clientY)
  const handleKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onToggleComplete(instruction.id)
    }
  }

  return (
    <Card
      className='fade-in'
      sx={{
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        opacity: instruction.completed ? 0.95 : 1,
        border: instruction.completed ? '1px solid #86efac' : '1px solid #e5e7eb',
        backgroundColor: instruction.completed ? '#f0fdf4' : '#ffffff',
        minHeight: cardMinHeight,
        height: '100%',
        width: '100%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s',
        position: 'relative',
        cursor: 'pointer',
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
      {instruction.completed && (
        <div className='absolute inset-0 pointer-events-none flex items-center justify-center'>
          <CheckCircleIcon sx={{ fontSize: 140, color: 'rgba(34,197,94,0.12)' }} />
        </div>
      )}

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
            <Typography component='span' sx={{ fontSize: 15, color: '#4b5563', fontWeight: 500, display: 'block', mt: 0.5, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
              {instruction.size || sub}
            </Typography>
          </Typography>
        </div>
        <div className='text-right flex-shrink-0 flex items-start gap-3'>
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
          <Checkbox
            checked={instruction.completed}
            onClick={e => { e.stopPropagation(); onToggleComplete(instruction.id, e.clientX, e.clientY) }}
            onChange={() => { }}
            icon={<RadioButtonUncheckedIcon />}
            checkedIcon={<CheckCircleIcon />}
            sx={{ p: 0, '&.Mui-checked': { color: '#16a34a' } }}
            inputProps={{ 'aria-label': '完了' }}
          />
        </div>
      </div>

      <div
        className='p-5 flex-grow space-y-3 text-sm'
        style={{ textDecoration: instruction.completed ? 'line-through' : 'none' }}
      >
        <div>
          <h4 className='font-bold text-gray-500 mb-1.5 text-xs uppercase tracking-wider'>仕様</h4>
          <div className='space-y-1 text-gray-700'>
            <div className='flex items-center'><PaletteIcon sx={{ mr: 1, color: '#6b7280', fontSize: 18 }} /><p className='w-20 text-gray-500 shrink-0'>カラー:</p><p className='font-medium'>{instruction.color || '-'}</p></div>
            <div className='flex items-center'><SquareFootIcon sx={{ mr: 1, color: '#6b7280', fontSize: 18 }} /><p className='w-20 text-gray-500 shrink-0'>サイズ:</p><p className='font-medium'>{instruction.size || '-'}</p></div>
            <div className='flex items-center'><SpringIcon sx={{ mr: 1, color: '#6b7280', fontSize: 18 }} /><p className='w-20 text-gray-500 shrink-0'>スプリング:</p><p className='font-medium'>{instruction.springType || '-'}</p></div>
            <div className='flex items-center'><Inventory2Icon sx={{ mr: 1, color: '#6b7280', fontSize: 18 }} /><p className='w-20 text-gray-500 shrink-0'>同梱物:</p><p className='font-medium'>{instruction.includedItems || instruction.note || '-'}</p></div>
            <div className='flex items-center'><NotesIcon sx={{ mr: 1, color: '#6b7280', fontSize: 18 }} /><p className='w-20 text-gray-500 shrink-0'>備考:</p><p className='font-medium'>{instruction.remarks || '-'}</p></div>
          </div>
        </div>
        <div>
          <h4 className='font-bold text-gray-500 mb-1.5 text-xs uppercase tracking-wider'>配送情報</h4>
          <div className='space-y-1 text-gray-700'>
            <div className='flex items-center'><LocalShippingIcon sx={{ mr: 1, color: '#6b7280', fontSize: 18 }} /><p className='w-20 text-gray-500 shrink-0'>配送方法:</p><p className='font-medium'>{instruction.shippingMethod || '-'}</p></div>
            <div className='flex items-center'><PlaceIcon sx={{ mr: 1, color: '#6b7280', fontSize: 18 }} /><p className='w-20 text-gray-500 shrink-0'>配送先:</p><p className='font-medium'>{instruction.destination || '-'}</p></div>
            {instruction.remarks && <div className='flex items-center'><EventIcon sx={{ mr: 1, color: '#ef4444', fontSize: 18 }} /><p className='w-20 text-gray-500 shrink-0'>特記:</p><p className='font-bold text-red-600'>{instruction.remarks}</p></div>}
            {instruction.createdAt && (
              <div className='flex items-center text-sm text-gray-500'><EventIcon sx={{ mr: 1, fontSize: 18 }} />{new Date(instruction.createdAt).toLocaleString()}</div>
            )}
          </div>
        </div>
      </div>

      <div className='p-4 bg-gray-50 rounded-b-xl flex justify-between items-center'>
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
        {isAdmin && (
          <div className='flex items-center gap-1'>
            <Button
              variant='text'
              size='small'
              onClick={e => { e.stopPropagation(); onEdit(instruction) }}
              startIcon={<EditOutlinedIcon />}
              sx={{ color: '#4f46e5', fontWeight: 600 }}
            >
              編集
            </Button>
            {onDelete && (
              <Button
                variant='text'
                size='small'
                onClick={e => { e.stopPropagation(); onDelete(instruction) }}
                startIcon={<DeleteOutlineIcon />}
                sx={{ color: '#dc2626', fontWeight: 600 }}
              >
                削除
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

export default ShippingInstructionCard
