'use client'

// React Imports
import { useState, useEffect, Fragment } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
// Local imports
import CameraGrid from './components/CameraGrid'
import SectionSummary from './components/SectionSummary'
import { useLotsData } from './hooks/useLotsData'
import { SECTION_CONFIG } from './utils/sectionConfig'

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

// セクション構成は utils/sectionConfig へ移動

const ImageInspection = () => {
  const [activeTab, setActiveTab] = useState(0)
  const { lotsData, getSectionLots, getLotStatus, getSectionStats, getFailReasons, getLatestLot, getLotShotsByCamera } = useLotsData()
  const [openRows, setOpenRows] = useState({})

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  // セクション毎のメソッドは useLotsData に移行

  const renderTabPanel = (value, index) => {
    if (value !== index) return null
    
    if (index === 0) {
      // 全体表示タブ
      return (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6} sx={{ display: 'flex' }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  リアルタイム監視: バネ留め検査（4カメラ）
                </Typography>
                {renderCameraGrid('バネ留め')}
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    最新のロット判定
                  </Typography>
                  {renderLatestLotSummary('バネ留め')}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} lg={6} sx={{ display: 'flex' }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  リアルタイム監視: A層検査（3カメラ）
                </Typography>
                {renderCameraGrid('A層')}
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    最新のロット判定
                  </Typography>
                  {renderLatestLotSummary('A層')}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )
    } else if (index === 1) {
      // バネ留め検査タブ
      return renderSectionTab('バネ留め')
    } else if (index === 2) {
      // A層検査タブ
      return renderSectionTab('A層')
    }
  }

  const renderSectionTab = (section) => {
    const stats = getSectionStats(section)
    const failReasons = getFailReasons(section)
    
    return (
      <>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8} sx={{ display: 'flex' }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  リアルタイム監視: {section}検査（{SECTION_CONFIG[section].cameras.length}カメラ）
                </Typography>
                {renderCameraGrid(section)}
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    最新のロット判定
                  </Typography>
                  {renderLatestLotSummary(section)}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} lg={4} sx={{ display: 'flex' }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
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
                        <Typography variant="body2" color="text.secondary">ロット総数</Typography>
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
                {section}検査 ロットログ
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: '60vh' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell width={56} />
                      <TableCell>日時</TableCell>
                      <TableCell>ロットID</TableCell>
                      <TableCell align="center">総合結果</TableCell>
                      <TableCell>各カメラ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getSectionLots(section).map((lot, index) => {
                      const isOpen = !!openRows[lot.lotId]
                      const toggle = () => setOpenRows(prev => ({ ...prev, [lot.lotId]: !isOpen }))
                      const shotsByCam = getLotShotsByCamera(lot.lotId)
                      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
                      return (
                        <Fragment key={lot.lotId}>
                          <TableRow hover>
                            <TableCell width={56}>
                              <IconButton size="small" onClick={toggle} aria-label="expand row">
                                {isOpen ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                              </IconButton>
                            </TableCell>
                            <TableCell>{lot.time}</TableCell>
                            <TableCell sx={{ fontWeight: 'medium' }}>{lot.lotId}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={getLotStatus(lot)}
                                color={getLotStatus(lot) === 'PASS' ? 'success' : 'error'}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {lot.cameras.map((c, i) => (
                                  <Chip
                                    key={i}
                                    label={`${c.name}: ${c.status}${c.status !== 'OK' && c.details && c.details !== '-' ? `（${c.details}）` : ''}`}
                                    size="small"
                                    color={c.status === 'OK' ? 'success' : 'error'}
                                    variant={c.status === 'OK' ? 'outlined' : 'filled'}
                                  />
                                ))}
                              </Box>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={5} sx={{ p: 0, bgcolor: 'grey.50' }}>
                              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                <Box sx={{ px: 3, py: 2 }}>
                                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                    撮影・検査履歴
                                  </Typography>
                                  <Divider sx={{ mb: 2 }} />
                                  <Grid container spacing={2}>
                                    {Object.entries(shotsByCam).map(([camId, shots]) => (
                                      <Grid item xs={12} md={6} key={camId}>
                                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                                          {camId}
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                          {shots.map((s, i) => (
                                            <Box key={i} sx={{ width: 160 }}>
                                              <Box
                                                sx={{
                                                  position: 'relative',
                                                  borderRadius: 1,
                                                  overflow: 'hidden',
                                                  aspectRatio: '16/9',
                                                  bgcolor: 'grey.900',
                                                }}
                                              >
                                                <img
                                                  src={`${basePath}/images/pages/CameraNotFound.png`}
                                                  alt={s.image_path || 'shot'}
                                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                                <Chip
                                                  label={s.status}
                                                  size="small"
                                                  color={s.status === 'PASS' ? 'success' : 'error'}
                                                  sx={{ position: 'absolute', top: 6, right: 6 }}
                                                />
                                              </Box>
                                              <Typography variant="caption" color="text.secondary" noWrap>
                                                {s.image_path}
                                              </Typography>
                                              {s.details && (
                                                <Typography variant="caption" color="error.main" display="block" noWrap>
                                                  {s.details}
                                                </Typography>
                                              )}
                                            </Box>
                                          ))}
                                        </Box>
                                      </Grid>
                                    ))}
                                  </Grid>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </Fragment>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </>
    )
  }

  // 最新ロット概要
  const renderLatestLotSummary = (section) => {
    const latest = getLatestLot(section)
    const lotStatus = latest ? getLotStatus(latest) : undefined
    return <SectionSummary latestLot={latest} lotStatus={lotStatus} />
  }

  // カメラグリッド（最新ロットの各カメラ状態を表示）
  const renderCameraGrid = (section) => {
    const latest = getLatestLot(section)
    const names = SECTION_CONFIG[section].cameras
    const statusByName = Object.fromEntries((latest?.cameras || []).map(c => [c.name, c.status]))
    return <CameraGrid cameraNames={names} statusByName={statusByName} />
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        
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
