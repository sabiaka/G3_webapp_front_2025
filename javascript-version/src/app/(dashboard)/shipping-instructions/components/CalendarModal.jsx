"use client"

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// シンプルな一覧モーダル: 左に日付、右に件数バッジ。選択で onSelect(date) を呼ぶ
export default function CalendarModal({ open, onClose, onSelect, items = [], selectedDate }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
      <DialogTitle>日付を選択</DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {items.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Typography color='text.secondary'>候補日がありません</Typography>
          </Box>
        ) : (
          <List dense disablePadding sx={{ maxHeight: 420, overflowY: 'auto' }}>
            {items.map(({ date, count }) => (
              <ListItem key={date} disablePadding>
                <ListItemButton selected={selectedDate === date} onClick={() => onSelect?.(date)}>
                  <ListItemText primary={date} />
                  <Badge color='primary' badgeContent={typeof count === 'number' ? count : 0} sx={{ mr: 1 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='secondary'>閉じる</Button>
      </DialogActions>
    </Dialog>
  )
}