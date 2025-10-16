// 入力フォームのコンポーネント

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'

import CategoryIcon from '@mui/icons-material/Category'
import SquareFootIcon from '@mui/icons-material/SquareFoot'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import NumbersIcon from '@mui/icons-material/Numbers'
import PaletteIcon from '@mui/icons-material/Palette'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import PlaceIcon from '@mui/icons-material/Place'
import NotesIcon from '@mui/icons-material/Notes'

import SpringIcon from './icons/SpringIcon'

const InstructionModal = ({ open, onClose, onSave, editMode, form, onFormChange, lineOptions }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>{editMode ? '指示編集' : '新規 製造指示'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label='品名'
              name='productName'
              value={form.productName}
              onChange={onFormChange}
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
              onChange={onFormChange}
              fullWidth
              size='small'
              sx={{ mb: 2 }}
              InputProps={{ startAdornment: (<InputAdornment position='start'><SquareFootIcon fontSize='small' /></InputAdornment>) }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Select label='担当ライン' name='line' value={form.line} onChange={onFormChange} fullWidth size='small' sx={{ mb: 2 }}>
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
              onChange={onFormChange}
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
              onChange={onFormChange}
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
              onChange={onFormChange}
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
              onChange={onFormChange}
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
              onChange={onFormChange}
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
              onChange={onFormChange}
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
              onChange={onFormChange}
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
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={onSave} variant='contained'>保存</Button>
      </DialogActions>
    </Dialog>
  )
}

export default InstructionModal
