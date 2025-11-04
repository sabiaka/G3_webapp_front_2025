// 今日のお知らせカード: ダッシュボード先頭に表示されるお知らせ・連絡欄
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
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import { alpha, useTheme } from "@mui/material/styles";
import useAuthMe from "@core/hooks/useAuthMe";

// Icons
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";

const STORAGE_KEY = "dashboard_notice_v1"; // 旧: テキストのみ
const STORAGE_KEY_V2 = "dashboard_notice_v2"; // 新: { text, priority }

// UI表示に使う内部の優先度値
const PRIORITIES = {
  important: { label: "重要" },
  warning: { label: "注意" },
  normal: { label: "通常" }
};

const NoticeCard = ({ height = 160 }) => {
  const [notice, setNotice] = useState(
    "本日の安全第一。午後は来客予定があります。\n17:00 までに作業場の整理整頓をお願いします。"
  );
  const [priority, setPriority] = useState("normal"); // 'important' | 'warning' | 'normal'
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [draftPriority, setDraftPriority] = useState("normal");
  const [updatedAt, setUpdatedAt] = useState(null); // ISO string
  const theme = useTheme();
  const { isAdmin } = useAuthMe();

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      // v2（JSON）の読み込みを優先
      const savedV2 = window.localStorage.getItem(STORAGE_KEY_V2);
      if (savedV2) {
        try {
          const parsed = JSON.parse(savedV2);
          if (parsed && typeof parsed === "object") {
            if (typeof parsed.text === "string") setNotice(parsed.text);
            if (["important", "warning", "normal"].includes(parsed.priority)) setPriority(parsed.priority);
            if (typeof parsed.updated_at === "string") setUpdatedAt(parsed.updated_at);
            return;
          }
        } catch (_) {
          // JSONでない場合は下のv1へフォールバック
        }
      }

      // v1（テキストのみ）のフォールバック
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && saved.trim().length > 0) {
        setNotice(saved);
        setPriority("normal");
        setUpdatedAt(null);
      }
    } catch (_) {
      // ignore storage errors
    }
  }, []);

  const handleOpenEdit = () => {
    setDraft(notice);
    setDraftPriority(priority);
    setIsEditOpen(true);
  };
  const handleCloseEdit = () => setIsEditOpen(false);
  const handleSaveEdit = () => {
    const value = draft?.trim() ?? "";
    setNotice(value);
    setPriority(draftPriority);
    const nowIso = new Date().toISOString();
    setUpdatedAt(nowIso);
    try {
      if (typeof window !== "undefined") {
        // v2形式で保存（v1キーは残すが参照は今後v2優先）
        const payload = JSON.stringify({ text: value, priority: draftPriority, updated_at: nowIso });
        window.localStorage.setItem(STORAGE_KEY_V2, payload);
      }
    } catch (_) {}
    setIsEditOpen(false);
  };

  // 重要度に応じてCardの見た目を切り替え
  const getStylesByPriority = () => {
    switch (priority) {
      case "important":
        return {
          borderColor: theme.palette.error.main,
          backgroundColor: alpha(theme.palette.error.main, 0.08),
          leftStripe: theme.palette.error.main,
          chipColor: "error"
        };
      case "warning":
        return {
          borderColor: theme.palette.warning.main,
          backgroundColor: alpha(theme.palette.warning.main, 0.08),
          leftStripe: theme.palette.warning.main,
          chipColor: "warning"
        };
      default:
        return {
          borderColor: theme.palette.divider,
          // 通常は白(紙色)に固定
          backgroundColor: theme.palette.background.paper,
          leftStripe: theme.palette.divider,
          chipColor: "default"
        };
    }
  };

  const styles = getStylesByPriority();

  const formatUpdatedAt = (iso) => {
    if (!iso) return null;
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
    } catch (_) {
      return iso;
    }
  };

  const subheader = updatedAt ? `最終更新: ${formatUpdatedAt(updatedAt)}` : undefined;

  return (
    <>
      <Card
        sx={{
          height,
          display: 'flex',
          flexDirection: 'column',
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: styles.borderColor,
          bgcolor: styles.backgroundColor,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
        role="button"
        aria-label="今日のお知らせを表示"
        onClick={handleOpenEdit}
      >
        {/* 左端のストライプ */}
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 4,
            height: '100%',
            backgroundColor: styles.leftStripe
          }}
        />
        <CardHeader
          title={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              今日のお知らせ
              <Chip size="small" label={PRIORITIES[priority]?.label ?? '通常'} color={styles.chipColor} variant={priority === 'normal' ? 'outlined' : 'filled'} />
            </span>
          }
          subheader={subheader}
          action={
            isAdmin ? (
              <Button variant="outlined" size="small" startIcon={<CreateOutlinedIcon />} onClick={(e) => { e.stopPropagation(); handleOpenEdit(); }}>
                編集
              </Button>
            ) : null
          }
        />
        <CardContent sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {notice && notice.length > 0 ? notice : "（お知らせは未設定です）"}
          </Typography>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle>お知らせの編集</DialogTitle>
        <DialogContent>
          {isAdmin ? (
            <>
              <TextField
                autoFocus
                fullWidth
                multiline
                minRows={6}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="例）午後は来客あり。14時からラインBの点検を実施します。"
              />
              <div style={{ height: 12 }} />
              <FormControl component="fieldset">
                <FormLabel component="legend">重要度</FormLabel>
                <RadioGroup
                  row
                  name="notice-priority"
                  value={draftPriority}
                  onChange={(e) => setDraftPriority(e.target.value)}
                >
                  <FormControlLabel value="important" control={<Radio color="error" />} label="重要" />
                  <FormControlLabel value="warning" control={<Radio color="warning" />} label="注意" />
                  <FormControlLabel value="normal" control={<Radio />} label="通常" />
                </RadioGroup>
              </FormControl>
            </>
          ) : (
            <>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <span>重要度</span>
                <Chip size="small" label={PRIORITIES[priority]?.label ?? '通常'} color={styles.chipColor} variant={priority === 'normal' ? 'outlined' : 'filled'} />
              </div>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {notice && notice.length > 0 ? notice : "（お知らせは未設定です）"}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {isAdmin ? (
            <>
              <Button onClick={handleCloseEdit} color="inherit">キャンセル</Button>
              <Button onClick={handleSaveEdit} variant="contained">保存</Button>
            </>
          ) : (
            <Button onClick={handleCloseEdit} variant="contained">閉じる</Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NoticeCard;
