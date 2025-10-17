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
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

const FilterBar = ({
  search,
  onSearchChange,
  line,
  onLineChange,
  completed,
  onCompletedChange,
  date,
  onDateChange,
  onPrevDate,
  onNextDate,
  canPrev = true,
  canNext = true,
  lineOptions,
  completedOptions,
  loadingLines = false
}) => {
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
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                fullWidth
                size='small'
                label='作成日'
                type='date'
                value={date || ''}
                onChange={e => onDateChange(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Tooltip title='前の日付'>
                <span>
                  <IconButton size='small' onClick={onPrevDate} disabled={!canPrev} aria-label='前の日付へ'>
                    <NavigateBeforeIcon fontSize='small' />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title='次の日付'>
                <span>
                  <IconButton size='small' onClick={onNextDate} disabled={!canNext} aria-label='次の日付へ'>
                    <NavigateNextIcon fontSize='small' />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default FilterBar
