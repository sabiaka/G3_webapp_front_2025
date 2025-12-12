import Grid from '@mui/material/Grid';

import ReportCard from './ReportCard';

export default function ReportList({ reports, dateFormatter, onViewDetail }) {
  return (
    <Grid container spacing={3}>
      {reports.map(report => (
        <Grid item xs={12} lg={6} xl={4} key={report.id}>
          <ReportCard report={report} dateFormatter={dateFormatter} onViewDetail={onViewDetail} />
        </Grid>
      ))}
    </Grid>
  );
}
