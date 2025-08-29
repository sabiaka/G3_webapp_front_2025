'use client'

// React Imports
import { useState, useEffect, useRef } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { styled } from '@mui/material/styles'

// Custom styled components
const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.875rem',
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}))

const DonutChart = ({ percentage, size = 128, color = '#10b981' }) => {
  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`

  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" component="div" fontWeight="bold" color="primary">
          {percentage.toFixed(1)}%
        </Typography>
      </Box>
    </Box>
  )
}

const ProductionTrendChart = ({ data, period, width, height }) => {
  const svgRef = useRef(null)

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return

    const svg = svgRef.current
    const padding = 40
    const chartWidth = width - padding
    const chartHeight = height - padding

    // Clear previous content
    svg.innerHTML = ''

    // Group data by date
    const groupedData = data.reduce((acc, curr) => {
      const date = curr.date
      if (!acc[date]) {
        acc[date] = { plan: 0, actual: 0, defective: 0 }
      }
      acc[date].plan += curr.plan
      acc[date].actual += curr.actual
      acc[date].defective += curr.defective
      return acc
    }, {})

    const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(a) - new Date(b))
    const maxVal = Math.max(...Object.values(groupedData).map(d => Math.max(d.plan, d.actual)))
    const maxDefectiveRate = Math.max(...Object.values(groupedData).map(d => d.actual > 0 ? (d.defective / d.actual * 100) : 0)) || 10

    // Create bars
    const bars = sortedDates.map((date, i) => {
      const x = (i / sortedDates.length) * chartWidth + (padding / 2)
      const barWidth = chartWidth / sortedDates.length * 0.6

      const planHeight = (groupedData[date].plan / maxVal) * chartHeight
      const actualHeight = (groupedData[date].actual / maxVal) * chartHeight

      return {
        plan: { x: x - barWidth / 2, y: height - padding - planHeight, width: barWidth / 2, height: planHeight },
        actual: { x: x, y: height - padding - actualHeight, width: barWidth / 2, height: actualHeight }
      }
    })

    // Create defective rate line points
    const pointsDefective = sortedDates.map((date, i) => {
      const x = (i / sortedDates.length) * chartWidth + (padding / 2)
      const rate = groupedData[date].actual > 0 ? (groupedData[date].defective / groupedData[date].actual * 100) : 0
      const y = height - (rate / maxDefectiveRate * chartHeight) - padding
      return `${x},${y}`
    }).join(' ')

    // Create date labels
    const labels = sortedDates.map((date, i) => {
      const x = (i / sortedDates.length) * chartWidth + (padding / 2)
      const dateObj = new Date(date)
      const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`
      return { x, y: height - 25, text: label }
    })

    // Render bars
    bars.forEach((bar, index) => {
      // Plan bar
      const planRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      planRect.setAttribute('x', bar.plan.x)
      planRect.setAttribute('y', bar.plan.y)
      planRect.setAttribute('width', bar.plan.width)
      planRect.setAttribute('height', bar.plan.height)
      planRect.setAttribute('fill', '#7dd3fc')
      planRect.setAttribute('class', 'bar-grow')
      svg.appendChild(planRect)

      // Actual bar
      const actualRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      actualRect.setAttribute('x', bar.actual.x)
      actualRect.setAttribute('y', bar.actual.y)
      actualRect.setAttribute('width', bar.actual.width)
      actualRect.setAttribute('height', bar.actual.height)
      actualRect.setAttribute('fill', '#6366f1')
      actualRect.setAttribute('class', 'bar-grow')
      svg.appendChild(actualRect)
    })

    // Render defective rate line
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
    polyline.setAttribute('points', pointsDefective)
    polyline.setAttribute('fill', 'none')
    polyline.setAttribute('stroke', '#ef4444')
    polyline.setAttribute('stroke-width', '3')
    polyline.setAttribute('class', 'chart-line')
    svg.appendChild(polyline)

    // Render labels
    labels.forEach(label => {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', label.x)
      text.setAttribute('y', label.y)
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('font-size', '12')
      text.setAttribute('fill', '#6b7280')
      text.textContent = label.text
      svg.appendChild(text)
    })

    // Render axis line
    const axisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    axisLine.setAttribute('x1', padding)
    axisLine.setAttribute('y1', height - padding)
    axisLine.setAttribute('x2', width - padding)
    axisLine.setAttribute('y2', height - padding)
    axisLine.setAttribute('stroke', '#e5e7eb')
    svg.appendChild(axisLine)

    // Render axis labels
    const maxRateLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    maxRateLabel.setAttribute('x', width - padding + 5)
    maxRateLabel.setAttribute('y', padding)
    maxRateLabel.setAttribute('font-size', '12')
    maxRateLabel.setAttribute('fill', '#ef4444')
    maxRateLabel.textContent = `${maxDefectiveRate.toFixed(0)}%`
    svg.appendChild(maxRateLabel)

    const minRateLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    minRateLabel.setAttribute('x', width - padding + 5)
    minRateLabel.setAttribute('y', height - padding)
    minRateLabel.setAttribute('font-size', '12')
    minRateLabel.setAttribute('fill', '#ef4444')
    minRateLabel.textContent = '0%'
    svg.appendChild(minRateLabel)

  }, [data, period, width, height])

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', minHeight: '20rem' }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: '100%' }}
      />
    </Box>
  )
}

const ProductionManagement = () => {
  const [period, setPeriod] = useState('week')
  const [filterDate, setFilterDate] = useState('')
  const [filterName, setFilterName] = useState('')
  const [chartDimensions, setChartDimensions] = useState({ width: 800, height: 400 })
  const chartContainerRef = useRef(null)

  const [productionData] = useState([
    { date: '2025-08-04', name: '製品A-102', plan: 2000, actual: 1980, defective: 35, employee: '山田 太郎', defective_details: [{ reason: '傷', count: 20 }, { reason: '寸法不良', count: 15 }] },
    { date: '2025-08-04', name: '製品C-301', plan: 1500, actual: 1450, defective: 21, employee: '佐藤 花子', defective_details: [{ reason: '塗装ムラ', count: 15 }, { reason: '異物混入', count: 6 }] },
    { date: '2025-08-04', name: '製品B-205', plan: 1000, actual: 1090, defective: 12, employee: '鈴木 一郎', defective_details: [{ reason: '傷', count: 12 }] },
    { date: '2025-08-03', name: '製品A-102', plan: 2000, actual: 2010, defective: 40, employee: '山田 太郎', defective_details: [{ reason: '傷', count: 25 }, { reason: '寸法不良', count: 15 }] },
    { date: '2025-08-02', name: '製品D-401', plan: 500, actual: 480, defective: 5, employee: '高橋 次郎', defective_details: [{ reason: '傷', count: 5 }] },
    { date: '2025-08-01', name: '製品A-102', plan: 2000, actual: 1950, defective: 30, employee: '山田 太郎', defective_details: [{ reason: '傷', count: 18 }, { reason: '寸法不良', count: 12 }] },
    { date: '2025-07-31', name: '製品A-102', plan: 2000, actual: 2050, defective: 45, employee: '山田 太郎', defective_details: [{ reason: '傷', count: 30 }, { reason: '寸法不良', count: 15 }] },
    { date: '2025-07-30', name: '製品C-301', plan: 1500, actual: 1510, defective: 20, employee: '佐藤 花子', defective_details: [{ reason: '塗装ムラ', count: 20 }] },
    { date: '2025-07-29', name: '製品B-205', plan: 1000, actual: 980, defective: 15, employee: '鈴木 一郎', defective_details: [{ reason: '傷', count: 15 }] },
  ])

  useEffect(() => {
    const updateChartDimensions = () => {
      if (chartContainerRef.current) {
        const rect = chartContainerRef.current.getBoundingClientRect()
        setChartDimensions({ width: rect.width, height: rect.height })
      }
    }

    updateChartDimensions()
    window.addEventListener('resize', updateChartDimensions)
    return () => window.removeEventListener('resize', updateChartDimensions)
  }, [])

  const handlePeriodChange = (event, newPeriod) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod)
    }
  }

  const getFilteredData = () => {
    return productionData.filter(item => {
      const dateMatch = !filterDate || item.date === filterDate
      const nameMatch = !filterName || item.name.toLowerCase().includes(filterName.toLowerCase())
      return dateMatch && nameMatch
    })
  }

  const getChartData = () => {
    const today = new Date('2025-08-04')
    let dataForChart = []

    if (period === 'week') {
      const oneWeekAgo = new Date(today)
      oneWeekAgo.setDate(today.getDate() - 6)
      dataForChart = productionData.filter(d => new Date(d.date) >= oneWeekAgo && new Date(d.date) <= today)
    } else {
      const oneMonthAgo = new Date(today)
      oneMonthAgo.setMonth(today.getMonth() - 1)
      dataForChart = productionData.filter(d => new Date(d.date) >= oneMonthAgo && new Date(d.date) <= today)
    }

    return dataForChart
  }

  const getChartStats = () => {
    const dataForChart = getChartData()
    const totalActual = dataForChart.reduce((sum, d) => sum + d.actual, 0)
    const totalDefective = dataForChart.reduce((sum, d) => sum + d.defective, 0)
    const totalPass = totalActual - totalDefective
    const yieldRate = totalActual > 0 ? (totalPass / totalActual) * 100 : 0

    return { totalActual, totalDefective, totalPass, yieldRate }
  }

  const getFailReasons = () => {
    const dataForChart = getChartData()
    const totalDefective = dataForChart.reduce((sum, d) => sum + d.defective, 0)
    
    if (totalDefective === 0) return []

    const reasonCounts = dataForChart.flatMap(d => d.defective_details || []).reduce((acc, curr) => {
      acc[curr.reason] = (acc[curr.reason] || 0) + curr.count
      return acc
    }, {})

    return Object.entries(reasonCounts)
      .map(([reason, count]) => ({ reason, count, percentage: Math.round((count / totalDefective) * 100) }))
      .sort((a, b) => b.count - a.count)
  }

  const getTodayProgress = () => {
    const today = '2025-08-04'
    const todayData = productionData.filter(d => d.date === today)
    const todayPlan = todayData.reduce((sum, d) => sum + d.plan, 0)
    const todayActual = todayData.reduce((sum, d) => sum + d.actual, 0)
    const todayProgress = todayPlan > 0 ? (todayActual / todayPlan) * 100 : 0

    return { plan: todayPlan, actual: todayActual, progress: todayProgress }
  }

  const renderFailReasons = () => {
    const failReasons = getFailReasons()
    
    if (failReasons.length === 0) {
      return (
        <Typography color="text.secondary" textAlign="center">
          不良品はありませんでした。
        </Typography>
      )
    }

    return (
      <Box sx={{ '& > * + *': { mt: 2 } }}>
        {failReasons.map((reason, index) => (
          <Box key={index}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" fontWeight="medium">
                {reason.reason}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {reason.count}件
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={reason.percentage}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        ))}
      </Box>
    )
  }

  const renderProductionTable = () => {
    const filteredData = getFilteredData()
    
    if (filteredData.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h4" color="text.secondary" sx={{ mb: 2 }}>
            😢
          </Typography>
          <Typography variant="h6" color="text.secondary">
            該当するレポートが見つかりませんでした。
          </Typography>
        </Box>
      )
    }

    return (
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>日付</TableCell>
              <TableCell>製品名</TableCell>
              <TableCell align="right">計画数</TableCell>
              <TableCell align="right">実績数</TableCell>
              <TableCell>達成率</TableCell>
              <TableCell align="right">不良数</TableCell>
              <TableCell>担当者</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row, index) => {
              const achievementRate = ((row.actual / row.plan) * 100).toFixed(2)
              const defectiveRate = row.actual > 0 ? ((row.defective / row.actual) * 100).toFixed(2) : 0

              let rateColor = 'success'
              if (achievementRate < 90) rateColor = 'error'
              else if (achievementRate < 100) rateColor = 'warning'

              return (
                <TableRow key={index}>
                  <TableCell sx={{ fontWeight: 'medium' }}>{row.date}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{row.name}</TableCell>
                  <TableCell align="right">{row.plan.toLocaleString()}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'semibold' }}>{row.actual.toLocaleString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(achievementRate, 100)}
                          color={rateColor}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight="bold" sx={{ width: 60, textAlign: 'right' }}>
                        {achievementRate}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      color={defectiveRate > 2 ? 'error.main' : 'text.primary'}
                      fontWeight={defectiveRate > 2 ? 'bold' : 'normal'}
                    >
                      {row.defective.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({defectiveRate}%)
                    </Typography>
                  </TableCell>
                  <TableCell>{row.employee}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  const todayProgress = getTodayProgress()
  const chartStats = getChartStats()

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            生産数管理
          </Typography>
        </Grid>

        <Grid container spacing={3}>
          {/* 左側コンテンツ */}
          <Grid item xs={12} lg={9}>
            {/* 生産推移グラフ */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" fontWeight="bold">
                    生産推移
                  </Typography>
                  <ToggleButtonGroup
                    value={period}
                    exclusive
                    onChange={handlePeriodChange}
                    size="small"
                    sx={{ bgcolor: 'grey.100', p: 0.5 }}
                  >
                    <StyledToggleButton value="week">週間</StyledToggleButton>
                    <StyledToggleButton value="month">月間</StyledToggleButton>
                  </ToggleButtonGroup>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: 'sky.300', mr: 1, borderRadius: 0.5 }} />
                    <Typography variant="body2">計画数</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: 'indigo.500', mr: 1, borderRadius: 0.5 }} />
                    <Typography variant="body2">実績数</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 12, height: 3, bgcolor: 'red.500', mr: 1 }} />
                    <Typography variant="body2">不良率</Typography>
                  </Box>
                </Box>
                
                <Box ref={chartContainerRef} sx={{ mt: 2, position: 'relative', flexGrow: 1, minHeight: '20rem' }}>
                  <ProductionTrendChart
                    data={getChartData()}
                    period={period}
                    width={chartDimensions.width}
                    height={chartDimensions.height}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* 下段グラフ */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      期間内 良品率
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DonutChart percentage={chartStats.yieldRate} size={128} color="#10b981" />
                      <Box sx={{ ml: 3 }}>
                        <Typography variant="body2">
                          <Typography component="span" fontWeight="semibold">総生産数:</Typography> {chartStats.totalActual.toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          <Typography component="span" fontWeight="semibold">不良品:</Typography> 
                          <Typography component="span" color="error.main">{chartStats.totalDefective.toLocaleString()}</Typography>
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      期間内 不良品内訳
                    </Typography>
                    {renderFailReasons()}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* 右側: 今日の進捗 */}
          <Grid item xs={12} lg={3}>
            <Card>
              <CardContent>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  今日の進捗
                </Typography>
                
                {/* PC表示 (縦長) */}
                <Box sx={{ display: { xs: 'none', lg: 'flex' }, flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', flexGrow: 1, pt: 2 }}>
                  <Box sx={{ textAlign: 'center', width: '100%' }}>
                    <Typography variant="h6" fontWeight="semibold">生産計画</Typography>
                    <Typography variant="h3" fontWeight="bold">{todayProgress.plan.toLocaleString()}</Typography>
                  </Box>
                  
                  <Box sx={{ position: 'relative', width: 80, flexGrow: 1, bgcolor: 'grey.200', borderRadius: '50px', my: 2 }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        background: 'linear-gradient(to top, #3b82f6, #06b6d4)',
                        borderRadius: '50px',
                        transition: 'height 0.5s ease',
                        height: `${Math.min(todayProgress.progress, 100)}%`,
                      }}
                    />
                  </Box>
                  
                  <Typography variant="h2" fontWeight="bold" sx={{ mb: 2 }}>
                    {todayProgress.progress.toFixed(1)}%
                  </Typography>
                  
                  <Box sx={{ textAlign: 'center', width: '100%' }}>
                    <Typography variant="h6" fontWeight="semibold">実績</Typography>
                    <Typography variant="h3" fontWeight="bold" color="primary.main">{todayProgress.actual.toLocaleString()}</Typography>
                  </Box>
                </Box>
                
                {/* スマホ表示 (横長) */}
                <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2 }}>
                    <Box>
                      <Typography variant="body1" fontWeight="semibold">実績</Typography>
                      <Typography variant="h4" fontWeight="bold" color="primary.main">{todayProgress.actual.toLocaleString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body1" fontWeight="semibold" textAlign="right">計画</Typography>
                      <Typography variant="h4" fontWeight="bold" textAlign="right">{todayProgress.plan.toLocaleString()}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: '50px', height: 24 }}>
                    <Box
                      sx={{
                        background: 'linear-gradient(to right, #3b82f6, #06b6d4)',
                        height: 24,
                        borderRadius: '50px',
                        textAlign: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'width 0.5s ease',
                        width: `${Math.min(todayProgress.progress, 100)}%`,
                      }}
                    >
                      {todayProgress.progress.toFixed(1)}%
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* テーブル */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                  生産レポート一覧
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: { xs: 2, md: 0 } }}>
                  <TextField
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    size="small"
                    sx={{ minWidth: 150 }}
                  />
                  <TextField
                    placeholder="製品名で検索"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    size="small"
                    sx={{ minWidth: 200 }}
                  />
                </Box>
              </Box>
              
              {renderProductionTable()}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ProductionManagement
