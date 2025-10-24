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

    return (
        <Grid container spacing={6} sx={{ mt: 0 }}>
            {/* KPIセクション */}
            <Grid item xs={12}>
                <Grid container spacing={4}>
                    {/* 生産進捗 */}
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardHeader title="生産進捗" action={<TrendingUpIcon color="primary" />} />
                            <CardContent>
                                <Box display="flex" alignItems="end" gap={1} mb={1}>
                                    <Typography variant="h3" color="primary.main" fontWeight={700}>
                                        {production.current.toLocaleString()}
                                    </Typography>
                                    <Typography variant="h6" color="text.secondary">/ {production.target.toLocaleString()} 個</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={kpiAchieve} sx={{ height: 10, borderRadius: 999 }} />
                                <Box textAlign="right" mt={1}>
                                    <Typography variant="body2" color="primary.main" fontWeight={700}>
                                        達成率: {kpiAchieve}%
                                    </Typography>
                                </Box>
                                <Box textAlign="right" mt={2}>
                                    <Button component={Link} href="/production-management" size="small" variant="text">
                                        詳細を見る →
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 機械稼働ステータス */}
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardHeader title="機械稼働ステータス" action={<HardwareIcon color="action" />} />
                            <CardContent>
                                <Stack spacing={1.5}>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Typography color="text.secondary">プレス機 #1</Typography>
                                        <Chip label="正常" color="success" size="small" />
                                    </Box>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Typography color="text.secondary">組立ライン #A</Typography>
                                        <Chip label="正常" color="success" size="small" />
                                    </Box>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Typography color="text.secondary">塗装ブース #2</Typography>
                                        <Chip label="待機中" color="warning" size="small" />
                                    </Box>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Typography color="text.secondary">検査機 #1</Typography>
                                        <Chip label="エラー" color="error" size="small" />
                                    </Box>
                                </Stack>
                                <Box textAlign="right" mt={2}>
                                    <Button component={Link} href="/machine-status" size="small" variant="text" color="inherit">
                                        詳細を見る →
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 画像検査ステータス */}
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardHeader title="画像検査ステータス" action={<CameraAltOutlinedIcon color="info" />} />
                            <CardContent>
                                <Box display="flex" alignItems="center" justifyContent="center" gap={3}>
                                    {/* 簡易円グラフ */}
                                    <Box position="relative" width={96} height={96}>
                                        <svg viewBox="0 0 36 36" width="96" height="96">
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
                                        <Box position="absolute" inset={0} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                                            <Typography variant="h5" fontWeight={700}>{goodRate}%</Typography>
                                            <Typography variant="caption">良品率</Typography>
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2">検査総数: {inspection.total.toLocaleString()}</Typography>
                                        <Typography variant="body2" color="info.main" fontWeight={700}>良品: {inspection.good.toLocaleString()}</Typography>
                                        <Typography variant="body2" color="error.main" fontWeight={700}>不良: {inspection.bad.toLocaleString()}</Typography>
                                    </Box>
                                </Box>
                                <Box textAlign="right" mt={2}>
                                    <Button component={Link} href="/image-inspection" size="small" variant="text" color="info">
                                        詳細を見る →
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>

            {/* 機能メニュー */}
            <Grid item xs={12}>
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardActionArea component={Link} href="/shipping-instructions">
                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ bgcolor: 'warning.light', color: 'warning.main', p: 1.5, borderRadius: 3 }}>
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
                        <Card>
                            <CardActionArea component={Link} href="/daily-reports">
                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ bgcolor: 'info.light', color: 'info.main', p: 1.5, borderRadius: 3 }}>
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
                        <Card>
                            <CardActionArea component={Link} href="/parts-inventory">
                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ bgcolor: 'success.light', color: 'success.main', p: 1.5, borderRadius: 3 }}>
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
                        <Card>
                            <CardHeader title="本日のタスク" action={<Button component={Link} href="/shipping-instructions" size="small">すべての指示を見る →</Button>} />
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Box bgcolor="grey.50" p={3} borderRadius={2} display="flex" justifyContent="space-between" alignItems="flex-end">
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
                                        <Box bgcolor="grey.50" p={3} borderRadius={2} display="flex" justifyContent="space-between" alignItems="flex-end">
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
                        </Card>
                    </Grid>

                    {/* 管理者メニュー */}
                    <Grid item xs={12} lg={4}>
                        <Card>
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
