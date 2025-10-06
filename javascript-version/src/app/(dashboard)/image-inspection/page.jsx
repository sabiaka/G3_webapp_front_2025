'use client'

// React Imports
import { useState } from 'react'

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
import { styled } from '@mui/material/styles'
import { useLotsData } from './hooks/useLotsData'
import SectionTab from './components/SectionTab'
import DonutChart from './components/DonutChart'
import CameraGrid from './components/CameraGrid'
import SectionSummary from './components/SectionSummary'
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

const ImageInspection = () => {
  const [activeTab, setActiveTab] = useState(0)
  const { lotsData, getSectionLots, getLotStatus, getSectionStats, getFailReasons, getLatestLot, getLotShotsByCamera } = useLotsData()
  const [openRows, setOpenRows] = useState({})
  const [lightbox, setLightbox] = useState({ open: false, src: '', alt: '' })

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  // 全体表示タブ
  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={6} sx={{ display: 'flex' }}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              リアルタイム監視: バネ留め検査（4カメラ）
            </Typography>
            <CameraGrid cameraNames={SECTION_CONFIG['バネ留め'].cameras} statusByName={Object.fromEntries((getLatestLot('バネ留め')?.cameras || []).map(c => [c.name, c.status]))} />
            <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                最新のロット判定
              </Typography>
              <SectionSummary latestLot={getLatestLot('バネ留め')} lotStatus={getLatestLot('バネ留め') ? getLotStatus(getLatestLot('バネ留め')) : undefined} />
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
            <CameraGrid cameraNames={SECTION_CONFIG['A層'].cameras} statusByName={Object.fromEntries((getLatestLot('A層')?.cameras || []).map(c => [c.name, c.status]))} />
            <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                最新のロット判定
              </Typography>
              <SectionSummary latestLot={getLatestLot('A層')} lotStatus={getLatestLot('A層') ? getLotStatus(getLatestLot('A層')) : undefined} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )

  // セクションタブ
  const renderSectionTab = (section) => (
    <SectionTab
      section={section}
      stats={getSectionStats(section)}
      failReasons={getFailReasons(section)}
      getSectionLots={getSectionLots}
      getLotStatus={getLotStatus}
      getLotShotsByCamera={getLotShotsByCamera}
      openRows={openRows}
      setOpenRows={setOpenRows}
      lightbox={lightbox}
      setLightbox={setLightbox}
      getLatestLot={getLatestLot}
    />
  )

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
          {activeTab === 0 && renderOverviewTab()}
          {activeTab === 1 && renderSectionTab('バネ留め')}
          {activeTab === 2 && renderSectionTab('A層')}
        </Grid>
      </Grid>
    </Box>
  )
}

export default ImageInspection
