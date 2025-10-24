"use client";

// Next Imports
import Link from "@/components/Link";

// MUI Imports
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";

// Icons (MUI)
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HardwareIcon from "@mui/icons-material/Hardware";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LiveTvOutlinedIcon from "@mui/icons-material/LiveTvOutlined";

// ダッシュボード（Materio + MUI 構成）
const DashboardPage = () => {
  // ダミー数値（後でAPIと接続可能）
  const production = { current: 1250, target: 2000 };
  const kpiAchieve = Math.round((production.current / production.target) * 100);

  const inspection = { total: 1280, good: 1216, bad: 64 };
  const goodRate = Math.round((inspection.good / inspection.total) * 100);

  // 半自動表層バネどめ機の直近エラーログ（ダミー）
  const errorLogs = [
    { id: 1, time: "2025-10-24 09:41", level: "error", message: "エア圧低下を検出。再起動を推奨" },
    { id: 2, time: "2025-10-24 08:55", level: "warning", message: "材料供給が一時停止（5秒）" },
    { id: 3, time: "2025-10-24 08:12", level: "info", message: "メンテナンスモード解除" }
  ];

  // KPIカードのヘッダー高さを揃えるための最小高さ（エラーログに合わせる）
  const headerMinHeight = 80;

  return (
    <Grid container spacing={6} sx={{ mt: 0 }}>
      {/* KPIセクション */}
      <Grid item xs={12}>
        <Grid container spacing={4}>
          {/* 生産進捗 */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardActionArea component={Link} href="/production-management" sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                <CardHeader title="生産進捗" action={<TrendingUpIcon color="primary" />} sx={{ minHeight: headerMinHeight }} />
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={2.5}>
                    {/* 生産進捗のドーナツグラフ */}
                    <Box position="relative" width={120} height={120}>
                      <svg viewBox="0 0 36 36" width="120" height="120">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="var(--mui-palette-action-disabledBackground)"
                          strokeWidth="3"
                        />
                        <path
                          strokeDasharray={`${kpiAchieve}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="var(--mui-palette-primary-main)"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                        <Typography variant="h5" fontWeight={700}>{kpiAchieve}%</Typography>
                        <Typography variant="caption">達成率</Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="body1">現在: <Typography component="span" fontWeight={700} color="primary.main">{production.current.toLocaleString()}</Typography> 個</Typography>
                      <Typography variant="body1">目標: {production.target.toLocaleString()} 個</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          {/* 機械稼働ステータス */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardActionArea component={Link} href="/machine-status" sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                <CardHeader title="半自動表層バネどめ機｜直近エラーログ" action={<HardwareIcon color="action" />} sx={{ minHeight: headerMinHeight }} />
                <CardContent>
                  <Stack spacing={1.5}>
                    {errorLogs.map(log => (
                      <Box key={log.id} display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="caption" color="text.disabled">{log.time}</Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>{log.message}</Typography>
                        </Box>
                        {log.level === 'error' && <Chip label="重大" color="error" size="small" />}
                        {log.level === 'warning' && <Chip label="警告" color="warning" size="small" />}
                        {log.level === 'info' && <Chip label="情報" color="info" size="small" />}
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          {/* 画像検査ステータス */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardActionArea component={Link} href="/image-inspection" sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                <CardHeader title="画像検査ステータス" action={<CameraAltOutlinedIcon color="info" />} sx={{ minHeight: headerMinHeight }} />
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={2.5}>
                    {/* 簡易円グラフ */}
                    <Box position="relative" width={120} height={120}>
                      <svg viewBox="0 0 36 36" width="120" height="120">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="var(--mui-palette-action-disabledBackground)"
                          strokeWidth="3"
                        />
                        <path
                          strokeDasharray={`${goodRate}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="var(--mui-palette-info-main)"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                        <Typography variant="h5" fontWeight={700}>{goodRate}%</Typography>
                        <Typography variant="caption">良品率</Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="body1">検査総数: {inspection.total.toLocaleString()}</Typography>
                      <Typography variant="body1" color="info.main" fontWeight={700}>良品: {inspection.good.toLocaleString()}</Typography>
                      <Typography variant="body1" color="error.main" fontWeight={700}>不良: {inspection.bad.toLocaleString()}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* 機能メニュー */}
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardActionArea component={Link} href="/shipping-instructions" sx={{ height: '100%' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ bgcolor: 'warning.main', color: 'common.white', p: 1.5, borderRadius: 3 }}>
                    <ListAltOutlinedIcon fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="h6">製造出荷指示</Typography>
                    <Typography variant="body2" color="text.secondary">本日の製造・出荷指示を確認</Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardActionArea component={Link} href="/daily-reports" sx={{ height: '100%' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ bgcolor: 'info.main', color: 'common.white', p: 1.5, borderRadius: 3 }}>
                    <CreateOutlinedIcon fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="h6">日報システム</Typography>
                    <Typography variant="body2" color="text.secondary">作業記録の入力・確認</Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardActionArea component={Link} href="/parts-inventory" sx={{ height: '100%' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ bgcolor: 'success.main', color: 'common.white', p: 1.5, borderRadius: 3 }}>
                    <Inventory2OutlinedIcon fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="h6">部品在庫管理</Typography>
                    <Typography variant="body2" color="text.secondary">QRコードで入出庫</Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* 生産目標/管理者メニュー */}
      <Grid item xs={12}>
        <Grid container spacing={4}>
          {/* 本日のタスク */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardActionArea component={Link} href="/shipping-instructions" sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                <CardHeader title="本日のタスク" />
                <CardContent>
                  <Grid container spacing={3} alignItems="stretch">
                    <Grid item xs={12} md={6}>
                      <Box bgcolor="grey.50" p={3} borderRadius={2} display="flex" justifyContent="space-between" alignItems="flex-end" sx={{ height: '100%' }}>
                        <Box>
                          <Chip label="マット" color="info" size="small" />
                          <Typography fontWeight={700} mt={1}>
                            マット <Typography component="span" variant="body2" color="text.secondary">/ 1200x1950x240</Typography>
                          </Typography>
                          <Typography variant="caption" color="error.main" fontWeight={700} mt={0.5} display="block">至急対応</Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="body2" color="text.secondary">数量</Typography>
                          <Typography variant="h4" color="primary.main" fontWeight={700}>1</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box bgcolor="grey.50" p={3} borderRadius={2} display="flex" justifyContent="space-between" alignItems="flex-end" sx={{ height: '100%' }}>
                        <Box>
                          <Chip label="ボトム" color="warning" size="small" />
                          <Typography fontWeight={700} mt={1}>
                            サポート <Typography component="span" variant="body2" color="text.secondary">/ 80巾</Typography>
                          </Typography>
                          <Typography variant="caption" color="text.secondary" mt={0.5} display="block">アマゾン直送便</Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="body2" color="text.secondary">数量</Typography>
                          <Typography variant="h4" color="primary.main" fontWeight={700}>1</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          {/* 管理者メニュー */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader title="管理者メニュー" />
              <CardContent>
                <Stack spacing={2}>
                  <Button
                    component={Link}
                    href="/employee-list"
                    variant="outlined"
                    color="inherit"
                    startIcon={<GroupOutlinedIcon />}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    従業員名簿の管理
                  </Button>
                  <Divider />
                  <Button
                    component={Link}
                    href="/machine-status"
                    variant="outlined"
                    color="inherit"
                    startIcon={<LiveTvOutlinedIcon />}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    サイネージ用モニター
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default DashboardPage;
