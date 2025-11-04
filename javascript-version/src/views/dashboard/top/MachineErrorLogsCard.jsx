"use client";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

import HardwareIcon from "@mui/icons-material/Hardware";
import Link from "@/components/Link";

const headerMinHeight = 80;

const MachineErrorLogsCard = () => {
  const errorLogs = [
    { id: 1, time: "2025-10-24 09:41", level: "error", message: "エア圧低下を検出。再起動を推奨" },
    { id: 2, time: "2025-10-24 08:55", level: "warning", message: "材料供給が一時停止（5秒）" },
    { id: 3, time: "2025-10-24 08:12", level: "info", message: "メンテナンスモード解除" }
  ];

  return (
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
  );
};

export default MachineErrorLogsCard;
