"use client"

import { useMemo, useState } from 'react'
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
import Button from '@mui/material/Button'
import Badge from '@mui/material/Badge'
import Collapse from '@mui/material/Collapse'
// Divider は縦幅最適化のため未使用に
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import FilterListIcon from '@mui/icons-material/FilterList'
import TodayIcon from '@mui/icons-material/Today'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

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
  loadingLines = false,
  onOpenCalendar
}) => {
  // 折りたたみフィルターの表示切替
  const [openMore, setOpenMore] = useState(false)

  // 適用中フィルター数（デフォルト以外をカウント）
  const activeCount = useMemo(() => {
    let c = 0
    if (search && String(search).trim().length > 0) c += 1
    if (line && line !== 'すべて') c += 1
    if (completed && completed !== 'all') c += 1
    return c
  }, [search, line, completed])

  return (
    <Card sx={{ mb: 2, borderRadius: 3, boxShadow: 1 }}>
      <CardContent sx={{ py: 1.25, px: { xs: 1.5, sm: 2 } }}>
        {/* 1行に日付ページング＋その他フィルターのトグルをまとめて縦幅を抑制 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          {/* 左側: 日付ページンググループ */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Tooltip title='前の日付'>
              <span>
                <IconButton color='primary' onClick={onPrevDate} disabled={!canPrev} aria-label='前の日付へ' sx={{ p: 1 }}>
                  <NavigateBeforeIcon />
                </IconButton>
              </span>
            </Tooltip>

            <TextField
              type='date'
              size='small'
              value={date || ''}
              onChange={e => onDateChange(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& input': { fontSize: 16, fontWeight: 600, py: 0.75, textAlign: 'center' },
                minWidth: { xs: 200, sm: 220 }
              }}
            />

            <Button
              size='small'
              variant='outlined'
              color='secondary'
              startIcon={<TodayIcon />}
              onClick={() => {
                const d = new Date()
                const y = d.getFullYear()
                const m = String(d.getMonth() + 1).padStart(2, '0')
                const dd = String(d.getDate()).padStart(2, '0')
                onDateChange?.(`${y}-${m}-${dd}`)
              }}
              aria-label='今日へ移動'
              sx={{ textTransform: 'none' }}
            >
              今日
            </Button>

            <Tooltip title='日付一覧を開く'>
              <span>
                <IconButton color='secondary' onClick={onOpenCalendar} aria-label='日付一覧' sx={{ p: 1 }}>
                  <CalendarMonthIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title='次の日付'>
              <span>
                <IconButton color='primary' onClick={onNextDate} disabled={!canNext} aria-label='次の日付へ' sx={{ p: 1 }}>
                  <NavigateNextIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          {/* 右側: その他フィルタのトグルと状態表示 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size='small'
              variant='text'
              startIcon={
                <Badge color='primary' overlap='circular' badgeContent={activeCount > 0 ? activeCount : null}>
                  <FilterListIcon />
                </Badge>
              }
              endIcon={openMore ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setOpenMore(v => !v)}
              sx={{ textTransform: 'none' }}
              aria-expanded={openMore}
              aria-controls='more-filters'
            >
              フィルター
            </Button>
          </Box>
        </Box>

        <Collapse in={openMore} timeout='auto' unmountOnExit>
          <Box id='more-filters' sx={{ mt: 1.25 }}>
            <Grid container spacing={2} alignItems='flex-end'>
              <Grid item xs={12} md={6}>
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
              <Grid item xs={6} md={3}>
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
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  )
}

export default FilterBar
