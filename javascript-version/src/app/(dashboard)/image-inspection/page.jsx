'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'

// データ取得用カスタムフック
import { useLotsData } from './hooks/useLotsData'

// セクションごとのタブ・カメラグリッド・サマリー表示用コンポーネント
import SectionTab from './components/SectionTab'
import CameraGrid from './components/CameraGrid'
import SectionSummary from './components/SectionSummary'

// セクション設定（カメラ構成など）
import { SECTION_CONFIG } from './utils/sectionConfig'

// タブのスタイル定義
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

// タブ全体のスタイル定義
const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    display: 'none',
  },
}))

// メインコンポーネント
const ImageInspection = () => {
  // 現在選択中のタブインデックス
  const [activeTab, setActiveTab] = useState(0)

  // 検査ロット関連のデータ取得・操作関数
  const {
    lotsData,
    getSectionLots,
    getLotStatus,
    getSectionStats,
    getFailReasons,
    getLatestLot,
    getLotShotsByCamera,
    getAvailableDates,
    ensureLotShotsLoaded
  } = useLotsData()

  // セクションごとの展開行状態（詳細表示用）
  const [openRows, setOpenRows] = useState({})

  // 画像拡大表示用ライトボックス状態
  const [lightbox, setLightbox] = useState({ open: false, src: '', fallback: '', alt: '' })

  // タブ切り替え時の処理
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  // 「全体表示」タブの内容
  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      {/* バネ留め検査のリアルタイム監視カード */}
      <Grid item xs={12} lg={6} sx={{ display: 'flex' }}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              リアルタイム監視: バネ留め検査（4カメラ）
            </Typography>
            {/* カメラごとの状態表示 */}
            <CameraGrid
              cameraNames={SECTION_CONFIG['バネ留め'].cameras}
              statusByName={Object.fromEntries(
                (getLatestLot('バネ留め')?.cameras || []).map(c => [c.name, c.status])
              )}
            />
            {/* 最新ロット判定のサマリー表示 */}
            <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                最新のロット判定
              </Typography>
              <SectionSummary
                latestLot={getLatestLot('バネ留め')}
                lotStatus={getLatestLot('バネ留め') ? getLotStatus(getLatestLot('バネ留め')) : undefined}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      {/* A層検査のリアルタイム監視カード */}
      <Grid item xs={12} lg={6} sx={{ display: 'flex' }}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              リアルタイム監視: A層検査（3カメラ）
            </Typography>
            {/* カメラごとの状態表示 */}
            <CameraGrid
              cameraNames={SECTION_CONFIG['A層'].cameras}
              statusByName={Object.fromEntries(
                (getLatestLot('A層')?.cameras || []).map(c => [c.name, c.status])
              )}
            />
            {/* 最新ロット判定のサマリー表示 */}
            <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                最新のロット判定
              </Typography>
              <SectionSummary
                latestLot={getLatestLot('A層')}
                lotStatus={getLatestLot('A層') ? getLotStatus(getLatestLot('A層')) : undefined}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )

  // 各セクションタブの内容（propsで必要な関数や状態を渡す）
  const renderSectionTab = (section) => (
    <SectionTab
      section={section}
      stats={getSectionStats(section)}
      failReasons={getFailReasons(section)}
      getSectionLots={getSectionLots}
      getLotStatus={getLotStatus}
      getLotShotsByCamera={getLotShotsByCamera}
      ensureLotShotsLoaded={ensureLotShotsLoaded}
      getSectionStats={getSectionStats}
      getFailReasons={getFailReasons}
      openRows={openRows}
      setOpenRows={setOpenRows}
      lightbox={lightbox}
      setLightbox={setLightbox}
      getLatestLot={getLatestLot}
      getAvailableDates={getAvailableDates}
    />
  )

  // レンダリング
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

// デフォルトエクスポート
export default ImageInspection
