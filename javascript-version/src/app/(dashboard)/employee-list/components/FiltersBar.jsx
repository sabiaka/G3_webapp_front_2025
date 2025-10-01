"use client"

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'

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
            <Select
              fullWidth
              size='small'
              value={department}
              onChange={e => setDepartment(e.target.value)}
              displayEmpty
            >
              {departmentOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={6} md={2}>
            <Select
              fullWidth
              size='small'
              value={status}
              onChange={e => setStatus(e.target.value)}
              displayEmpty
            >
              {statusOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default FiltersBar
