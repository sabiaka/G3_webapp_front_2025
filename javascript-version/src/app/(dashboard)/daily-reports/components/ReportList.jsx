import Grid from '@mui/material/Grid';
import ReportCard from './ReportCard';

// ★ props に onEdit を追加して受け取ります
export default function ReportList({ reports, onDelete, onViewDetail, onEdit }) {
  return (
    <Grid container spacing={3}>
      {reports.map((report) => (
        <Grid item xs={12} sm={6} md={4} key={report.id}>
          <ReportCard 
            report={report} 
            onDelete={onDelete}
            onViewDetail={onViewDetail}
            onEdit={onEdit} // ★ これを追加して、ReportCardに渡します！
          /> 
        </Grid>
      ))}
    </Grid>
  );
}