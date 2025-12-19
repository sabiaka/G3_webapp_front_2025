import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export default function ReportModal({ open, form, onChange, onClose, onSave }) {
  const handleFieldChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 300 } }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95vw', sm: 500 },
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <Typography variant="h6" fontWeight="bold" mb={2}>
            日報入力
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="担当者" value={form.user} fullWidth size="small" InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="日付"
                type="date"
                value={form.date}
                onChange={event => handleFieldChange('date', event.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="製品名"
                value={form.product}
                onChange={event => handleFieldChange('product', event.target.value)}
                fullWidth
                size="small"
                placeholder="製品A-102"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="生産実績数"
                value={form.result}
                onChange={event => handleFieldChange('result', event.target.value)}
                fullWidth
                size="small"
                placeholder="1050"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="今日の作業内容"
                value={form.work}
                onChange={event => handleFieldChange('work', event.target.value)}
                fullWidth
                size="small"
                multiline
                minRows={4}
                placeholder={'箇条書きでOK！\n例：\n・製品A-102の組立\n・部品B-5の供給遅れ（30分ロス）\n・1050個完了'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="メモ"
                value={form.memo}
                onChange={event => handleFieldChange('memo', event.target.value)}
                fullWidth
                size="small"
                multiline
                minRows={2}
                placeholder="気づいた点、改善提案など"
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button variant="outlined" color="inherit" onClick={onClose}>
              キャンセル
            </Button>
            <Button variant="contained" color="primary" onClick={onSave}>
              保存
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}
