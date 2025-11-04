"use client";

// React
import { useEffect, useState } from "react";

// MUI
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";

// Icons
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";

const STORAGE_KEY = "dashboard_notice_v1";

const NoticeCard = () => {
  const [notice, setNotice] = useState(
    "本日の安全第一。午後は来客予定があります。\n17:00 までに作業場の整理整頓をお願いします。"
  );
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (saved && saved.trim().length > 0) setNotice(saved);
    } catch (_) {
      // ignore storage errors
    }
  }, []);

  const handleOpenEdit = () => {
    setDraft(notice);
    setIsEditOpen(true);
  };
  const handleCloseEdit = () => setIsEditOpen(false);
  const handleSaveEdit = () => {
    const value = draft?.trim() ?? "";
    setNotice(value);
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {}
    setIsEditOpen(false);
  };

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardHeader
          title="今日のお知らせ"
          action={
            <Button variant="outlined" size="small" startIcon={<CreateOutlinedIcon />} onClick={handleOpenEdit}>
              編集
            </Button>
          }
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {notice && notice.length > 0 ? notice : "（お知らせは未設定です）"}
          </Typography>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle>お知らせの編集</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={6}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="例）午後は来客あり。14時からラインBの点検を実施します。"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} color="inherit">キャンセル</Button>
          <Button onClick={handleSaveEdit} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NoticeCard;
