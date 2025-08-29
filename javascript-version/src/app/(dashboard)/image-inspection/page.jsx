'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import { styled } from '@mui/material/styles'

// Custom styled components
const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.875rem',
  minHeight: 48,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    borderBottom: `2px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.primary.light + '20',
  },
}))

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    display: 'none',
  },
}))

const DonutChart = ({ percentage, size = 160 }) => {
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
          stroke="#10b981"
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
        <Typography variant="h3" component="div" fontWeight="bold" color="primary">
          {percentage}%
        </Typography>
        <Typography variant="body2" color="text.secondary">
          良品率
        </Typography>
      </Box>
    </Box>
  )
}

const ImageInspection = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [inspectionData] = useState([
    { 
      time: '10:18:12', 
      camera: 'バネ留め', 
      id: 'SPRING-001', 
      status: 'PASS', 
      details: '-', 
      date: '2024-07-15' 
    },
    { 
      time: '10:18:08', 
      camera: 'A層', 
      id: 'A-102-1249', 
      status: 'PASS', 
      details: '-', 
      date: '2024-07-15' 
    },
    { 
      time: '10:18:04', 
      camera: 'A層', 
      id: 'A-102-1248', 
      status: 'FAIL', 
      details: '傷あり', 
      date: '2024-07-15' 
    },
    { 
      time: '10:17:59', 
      camera: 'バネ留め', 
      id: 'SPRING-002', 
      status: 'PASS', 
      details: '-', 
      date: '2024-07-15' 
    },
    { 
      time: '10:17:51', 
      camera: 'A層', 
      id: 'B-201-0015', 
      status: 'PASS', 
      details: '-', 
      date: '2024-07-15' 
    },
    { 
      time: '10:17:48', 
      camera: 'バネ留め', 
      id: 'SPRING-003', 
      status: 'FAIL', 
      details: '位置ずれ', 
      date: '2024-07-15' 
    },
    { 
      time: '10:16:55', 
      camera: 'A層', 
      id: 'C-301-0512', 
      status: 'FAIL', 
      details: '異物混入', 
      date: '2024-07-15' 
    },
    { 
      time: '10:16:51', 
      camera: 'バネ留め', 
      id: 'SPRING-004', 
      status: 'PASS', 
      details: '-', 
      date: '2024-07-15' 
    },
    { 
      time: '10:15:48', 
      camera: 'バネ留め', 
      id: 'SPRING-005', 
      status: 'FAIL', 
      details: '位置ずれ', 
      date: '2024-07-15' 
    },
    { 
      time: '10:15:04', 
      camera: 'A層', 
      id: 'A-102-1247', 
      status: 'FAIL', 
      details: '傷あり', 
      date: '2024-07-15' 
    },
  ])

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const getCameraData = (cameraType) => {
    return inspectionData.filter(log => log.camera === cameraType)
  }

  const getCameraStats = (cameraType) => {
    const logs = getCameraData(cameraType)
    const total = logs.length
    const fail = logs.filter(l => l.status === 'FAIL').length
    const pass = total - fail
    const passRate = total > 0 ? Math.round((pass / total) * 100) : 100
    
    return { total, pass, fail, passRate }
  }

  const getFailReasons = (cameraType) => {
    const failLogs = inspectionData.filter(log => log.camera === cameraType && log.status === 'FAIL')
    if (failLogs.length === 0) return []
    
    const reasonCounts = failLogs.reduce((acc, log) => {
      acc[log.details] = (acc[log.details] || 0) + 1
      return acc
    }, {})
    
    return Object.entries(reasonCounts)
      .map(([reason, count]) => ({ reason, count, percentage: Math.round((count / failLogs.length) * 100) }))
      .sort((a, b) => b.count - a.count)
  }

  const getLatestResult = (cameraType) => {
    return inspectionData.find(log => log.camera === cameraType) || null
  }

  const renderTabPanel = (value, index) => {
    if (value !== index) return null
    
    if (index === 0) {
      // 全体表示タブ
      return (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  リアルタイム監視: バネ留め検査
                </Typography>
                <Box
                  sx={{
                    bgcolor: 'black',
                    borderRadius: 2,
                    aspectRatio: '16/9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <Typography color="grey.500" variant="h6">
                    SPRING FASTENER - LIVE FEED
                  </Typography>
                </Box>
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    最新の検査結果
                  </Typography>
                  {renderLatestResult('バネ留め')}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  リアルタイム監視: A層検査
                </Typography>
                <Box
                  sx={{
                    bgcolor: 'black',
                    borderRadius: 2,
                    aspectRatio: '16/9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <Typography color="grey.500" variant="h6">
                    A-LAYER - LIVE FEED
                  </Typography>
                </Box>
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    最新の検査結果
                  </Typography>
                  {renderLatestResult('A層')}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )
    } else if (index === 1) {
      // バネ留め検査タブ
      return renderCameraTab('バネ留め')
    } else if (index === 2) {
      // A層検査タブ
      return renderCameraTab('A層')
    }
  }

  const renderCameraTab = (cameraType) => {
    const stats = getCameraStats(cameraType)
    const failReasons = getFailReasons(cameraType)
    
    return (
      <>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  リアルタイム監視: {cameraType}検査
                </Typography>
                <Box
                  sx={{
                    bgcolor: 'black',
                    borderRadius: 2,
                    aspectRatio: '16/9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <Typography color="grey.500" variant="h6">
                    {cameraType === 'バネ留め' ? 'SPRING FASTENER' : 'A-LAYER'} - LIVE FEED
                  </Typography>
                </Box>
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    最新の検査結果
                  </Typography>
                  {renderLatestResult(cameraType)}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent sx={{ '& > * + *': { mt: 3 } }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    本日のサマリー
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <DonutChart percentage={stats.passRate} />
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 1, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">検査総数</Typography>
                        <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 1, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">良品</Typography>
                        <Typography variant="h4" fontWeight="bold" color="success.main">{stats.pass}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 1, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">不良品</Typography>
                        <Typography variant="h4" fontWeight="bold" color="error.main">{stats.fail}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    不良原因
                  </Typography>
                  {failReasons.length === 0 ? (
                    <Typography color="text.secondary">本日の不良品はありません。</Typography>
                  ) : (
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
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {cameraType}検査 ログ
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: '40vh' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>日時</TableCell>
                      <TableCell>製品ID</TableCell>
                      <TableCell align="center">結果</TableCell>
                      <TableCell>詳細</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getCameraData(cameraType).map((log, index) => (
                      <TableRow key={index}>
                        <TableCell>{log.time}</TableCell>
                        <TableCell sx={{ fontWeight: 'medium' }}>{log.id}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={log.status}
                            color={log.status === 'PASS' ? 'success' : 'error'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{log.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </>
    )
  }

  const renderLatestResult = (cameraType) => {
    const latest = getLatestResult(cameraType)
    
    if (!latest) {
      return (
        <Typography color="text.secondary">
          本日の検査データはありません。
        </Typography>
      )
    }

    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {latest.time}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {latest.id}
          </Typography>
          {latest.details !== '-' && (
            <Typography variant="body2" color="error.main" sx={{ mt: 0.5 }}>
              {latest.details}
            </Typography>
          )}
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography
            variant="h3"
            fontWeight="bold"
            color={latest.status === 'PASS' ? 'success.main' : 'error.main'}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            {latest.status}
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            画像検査ステータス
          </Typography>
        </Grid>
        
        {/* タブナビゲーション */}
        <Grid item xs={12}>
          <StyledTabs value={activeTab} onChange={handleTabChange}>
            <StyledTab label="全体表示" />
            <StyledTab label="バネ留め検査" />
            <StyledTab label="A層検査" />
          </StyledTabs>
        </Grid>
        
        {/* タブコンテンツ */}
        <Grid item xs={12}>
          {renderTabPanel(activeTab, 0)}
          {renderTabPanel(activeTab, 1)}
          {renderTabPanel(activeTab, 2)}
        </Grid>
      </Grid>
    </Box>
  )
}

export default ImageInspection
