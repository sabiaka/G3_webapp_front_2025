import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';

export default function ReportModal({ open, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    employee_id: '',
    line_id: '',
    report_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [employeeList, setEmployeeList] = useState([]);
  const [lineList, setLineList] = useState([]);

  // 編集モード判定
  const isEditMode = Boolean(initialData);

  // マスタデータ取得
  useEffect(() => {
    if (open) {
      const fetchMasters = async () => {
        try {
          const [empRes, lineRes] = await Promise.all([
            fetch('/api/employees'),
            fetch('/api/lines')      
          ]);

          if (empRes.ok) {
            const data = await empRes.json();
            setEmployeeList(data.employees || (Array.isArray(data) ? data : []));
          }

          if (lineRes.ok) {
            const data = await lineRes.json();
            setLineList(Array.isArray(data) ? data : (data.lines || []));
          }

        } catch (error) {
          console.error('マスタデータ取得エラー:', error);
        }
      };
      fetchMasters();
    }
  }, [open]);

  // 編集データがあればフォームにセット
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
            employee_id: initialData.employee_id || '',
            line_id: initialData.line_id || '',
            report_date: initialData.date ? initialData.date.split('T')[0] : '',
            notes: initialData.work || '' 
        });
      } else {
        setFormData({
          employee_id: '',
          line_id: '',
          report_date: new Date().toISOString().split('T')[0],
          notes: ''
        });
      }
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!formData.employee_id || !formData.line_id || !formData.report_date) {
      alert('担当者、日付、製品名は必須です');
      return;
    }
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        {isEditMode ? '日報の編集' : '日報の新規登録'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <TextField
            label="日付"
            type="date"
            name="report_date"
            value={formData.report_date}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            label="担当者"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleChange}
            fullWidth
          >
            {employeeList.length === 0 && <MenuItem disabled>読み込み中...</MenuItem>}
            {employeeList.map((emp) => (
              <MenuItem key={emp.employee_id} value={emp.employee_id}>
                {/* ★修正: ID表示を削除し、名前だけにしました */}
                {emp.employee_name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="製品名 (ライン)"
            name="line_id"
            value={formData.line_id}
            onChange={handleChange}
            fullWidth
          >
             {lineList.length === 0 && <MenuItem disabled>読み込み中...</MenuItem>}
             {lineList.map((line) => (
              <MenuItem key={line.line_id} value={line.line_id}>
                {line.line_name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="作業内容"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
            placeholder="本日の作業内容..."
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">キャンセル</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {isEditMode ? '更新する' : '登録する'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}