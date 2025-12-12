import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

export default function ReportFilter({ searchUser, searchDate, searchProduct, onChange }) {
  return (
    <Card sx={{ mb: 6, borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={6}>
            <TextField
              label="担当者"
              value={searchUser}
              onChange={event => onChange('searchUser', event.target.value)}
              fullWidth
              size="small"
              placeholder="山田 太郎"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={3} lg={3}>
            <TextField
              label="日付"
              type="date"
              value={searchDate}
              onChange={event => onChange('searchDate', event.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={3} lg={3}>
            <TextField
              label="製品名"
              value={searchProduct}
              onChange={event => onChange('searchProduct', event.target.value)}
              fullWidth
              size="small"
              placeholder="製品A-102"
              variant="outlined"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
