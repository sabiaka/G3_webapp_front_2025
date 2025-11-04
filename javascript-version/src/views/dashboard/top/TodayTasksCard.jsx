"use client";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

import Link from "@/components/Link";

const TodayTasksCard = () => {
  return (
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
  );
};

export default TodayTasksCard;
