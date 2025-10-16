"use client"

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'

const FiltersBar = ({ search, setSearch, department, setDepartment, status, setStatus, departmentOptions, statusOptions }) => {
  return (
    <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 1 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label='氏名で検索'
              size='small'
              value={search}
              onChange={e => setSearch(e.target.value)}
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
              <InputLabel id='filter-dept-label'>所属部署</InputLabel>
              <Select
                labelId='filter-dept-label'
                id='filter-dept'
                label='所属部署'
                value={department}
                onChange={e => setDepartment(e.target.value)}
              >
                {departmentOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size='small'>
              <InputLabel id='filter-status-label'>在籍状況</InputLabel>
              <Select
                labelId='filter-status-label'
                id='filter-status'
                label='在籍状況'
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                {statusOptions.map(opt => (
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

export default FiltersBar
