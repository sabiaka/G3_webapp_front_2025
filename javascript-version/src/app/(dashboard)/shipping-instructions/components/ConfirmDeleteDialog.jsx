// 削除確認ダイアログ

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

const ConfirmDeleteDialog = ({ open, onCancel, onConfirm, itemTitle }) => (
  <Dialog open={open} onClose={onCancel}>
    <DialogTitle>この指示を削除しますか？</DialogTitle>
    <DialogContent>
      <Typography>
        {itemTitle ? `「${itemTitle}」を削除します。よろしいですか？` : 'この指示を削除します。よろしいですか？'}
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>キャンセル</Button>
      <Button onClick={onConfirm} color='error' variant='contained'>削除する</Button>
    </DialogActions>
  </Dialog>
)

export default ConfirmDeleteDialog
