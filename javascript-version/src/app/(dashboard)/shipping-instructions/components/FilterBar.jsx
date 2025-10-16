// フィルターバーのコンポーネント

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'

const FilterBar = ({ search, onSearchChange, line, onLineChange, completed, onCompletedChange, lineOptions, completedOptions, loadingLines = false }) => {
  return (
    <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 1 }}>
      <CardContent>
        <Grid container spacing={2} alignItems='flex-end'>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label='品名 / 配送先 / 備考で検索'
              size='small'
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <span className='ri-search-line' />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size='small'>
              <InputLabel id='filter-line-label'>担当ライン</InputLabel>
              <Select
                labelId='filter-line-label'
                id='filter-line'
                label='担当ライン'
                value={line}
                onChange={e => onLineChange(e.target.value)}
                disabled={loadingLines}
              >
                {loadingLines ? (
                  <MenuItem value={line} disabled>読み込み中…</MenuItem>
                ) : (
                  lineOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size='small'>
              <InputLabel id='filter-completed-label'>完了状態</InputLabel>
              <Select
                labelId='filter-completed-label'
                id='filter-completed'
                label='完了状態'
                value={completed}
                onChange={e => onCompletedChange(e.target.value)}
              >
                {completedOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default FilterBar
