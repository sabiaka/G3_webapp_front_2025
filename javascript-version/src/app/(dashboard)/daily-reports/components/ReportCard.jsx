import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function ReportCard({ report, dateFormatter, onViewDetail }) {
  const handleDetailClick = () => {
    if (onViewDetail) {
      onViewDetail(report);
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.3s',
        '&:hover': { boxShadow: 8 },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: report.avatarColor,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: 22,
              mr: 2,
            }}
          >
            {report.avatarText}
          </Box>
          <Box>
            <Typography fontWeight="bold" color="text.primary">
              {report.user}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dateFormatter(report.date)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ fontSize: 15, color: 'text.secondary', mb: 1 }}>
          <strong style={{ width: 60, display: 'inline-block', color: '#6b7280' }}>
            製品名:
          </strong>{' '}
          <span style={{ fontWeight: 600 }}>{report.product}</span>
        </Box>
        <Box sx={{ fontSize: 15, color: 'text.secondary', mb: 1 }}>
          <strong style={{ width: 60, display: 'inline-block', color: '#6b7280' }}>
            生産実績:
          </strong>{' '}
          <span style={{ fontWeight: 600 }}>{report.result}</span>
        </Box>
        <Box sx={{ mt: 1 }}>
          <strong style={{ color: '#6b7280', marginBottom: 4, display: 'inline-block' }}>
            作業内容:
          </strong>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {report.work}
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button size="small" color="primary" sx={{ fontWeight: 'bold' }} onClick={handleDetailClick}>
          詳細を見る &rarr;
        </Button>
      </CardActions>
    </Card>
  );
}
