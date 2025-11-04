// 生産進捗カード: KPI達成率のドーナツグラフ表示

"use client";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Link from "@/components/Link";

const headerMinHeight = 80;

const ProductionProgressCard = () => {
  const production = { current: 1250, target: 2000 };
  const kpiAchieve = Math.round((production.current / production.target) * 100);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea component={Link} href="/production-management" sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <CardHeader title="生産進捗" action={<TrendingUpIcon color="primary" />} sx={{ minHeight: headerMinHeight }} />
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" gap={2.5}>
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
  );
};

export default ProductionProgressCard;
