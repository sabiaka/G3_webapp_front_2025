import Grid from '@mui/material/Grid';
import ReportCard from './ReportCard';

// ★ currentUser, isAdmin を受け取る
export default function ReportList({ reports, onDelete, onViewDetail, onEdit, currentUser, isAdmin }) {
  return (
    <Grid container spacing={3}>
      {reports.map((report) => (
        <Grid item xs={12} sm={6} md={4} key={report.id}>
          <ReportCard 
            report={report} 
            onDelete={onDelete}
            onViewDetail={onViewDetail}
            onEdit={onEdit}
            // ★ カードに渡す
            currentUser={currentUser}
            isAdmin={isAdmin}
          /> 
        </Grid>
      ))}
    </Grid>
  );
}