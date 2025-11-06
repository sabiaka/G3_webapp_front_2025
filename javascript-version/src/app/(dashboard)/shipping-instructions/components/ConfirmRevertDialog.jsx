// 完了を取り消すか聞くダイアログ

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

const ConfirmRevertDialog = ({ open, onCancel, onConfirm }) => (
  <Dialog open={open} onClose={onCancel}>
    <DialogTitle>完了を取り消しますか？</DialogTitle>
    <DialogContent>
      <Typography>この指示を未完了に戻しますか？</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>キャンセル</Button>
      <Button onClick={onConfirm} variant='contained'>未完了に戻す</Button>
    </DialogActions>
  </Dialog>
)

export default ConfirmRevertDialog
