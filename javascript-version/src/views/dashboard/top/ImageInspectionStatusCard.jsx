// 画像検査ステータスカード: 良品率の円グラフ表示

"use client";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import Link from "@/components/Link";

const headerMinHeight = 80;

const ImageInspectionStatusCard = () => {
  const inspection = { total: 1280, good: 1216, bad: 64 };
  const goodRate = Math.round((inspection.good / inspection.total) * 100);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea component={Link} href="/image-inspection" sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <CardHeader title="画像検査ステータス" action={<CameraAltOutlinedIcon color="info" />} sx={{ minHeight: headerMinHeight }} />
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
  );
};

export default ImageInspectionStatusCard;
