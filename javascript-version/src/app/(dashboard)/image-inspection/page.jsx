'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

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
    getSectionLots,
    getLotStatus,
    getSectionStats,
    getFailReasons,
    getLatestLot,
    getLotShotsByCamera,
    getAvailableDates,
    ensureLotShotsLoaded,
    getLotById,
    ensureLotLoaded,
  } = useLotsData()

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selectedLotId = searchParams.get('lot')

  useEffect(() => {
    if (!selectedLotId) return
    ensureLotLoaded(selectedLotId)
  }, [selectedLotId, ensureLotLoaded])

  const selectedLotInfo = useMemo(() => getLotById(selectedLotId), [getLotById, selectedLotId])

  useEffect(() => {
    if (!selectedLotInfo) return
    const sectionToTabIndex = {
      'バネ留め': 1,
      'A層': 2,
    }
    const targetIndex = sectionToTabIndex[selectedLotInfo.section]
    if (typeof targetIndex === 'number' && targetIndex !== activeTab) {
      setActiveTab(targetIndex)
    }
  }, [selectedLotInfo, activeTab])

  const updateUrlWithLot = lotId => {
    const currentLot = searchParams.get('lot')
    const params = new URLSearchParams(searchParams.toString())

    if (lotId) {
      if (currentLot === lotId) return
      params.set('lot', lotId)
    } else {
      if (!currentLot) return
      params.delete('lot')
    }

    const queryString = params.toString()
    const url = queryString ? `${pathname}?${queryString}` : pathname
    router.push(url, { scroll: false })
  }

  const handleOpenLot = lot => {
    ensureLotLoaded?.(lot.lotId)
    updateUrlWithLot(lot.lotId)
  }

  const handleCloseLot = () => {
    updateUrlWithLot(null)
  }

  // 画像拡大表示用ライトボックス状態
  const [lightbox, setLightbox] = useState({ open: false, src: '', fallback: '', alt: '' })

  // タブ切り替え時の処理
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  // 「全体表示」タブの内容
  const renderOverviewTab = () => {
    const renderRealtimeCard = sectionKey => {
      const latest = getLatestLot(sectionKey)
      const lotStatus = latest ? getLotStatus(latest) : undefined
      const dynamicNames = Array.from(new Set((latest?.cameras || []).map(cam => cam?.name).filter(Boolean)))
      const fallbackNames = SECTION_CONFIG[sectionKey]?.cameras || []
      const cameraNames = dynamicNames.length ? dynamicNames : fallbackNames
      const statusByName = Object.fromEntries((latest?.cameras || []).filter(cam => cam?.name).map(cam => [cam.name, cam.status]))
      const cameraCount = cameraNames.length
      const title = `${sectionKey}検査`

      return (
        <Grid item xs={12} lg={6} sx={{ display: 'flex' }} key={sectionKey}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                リアルタイム監視: {title}（{cameraCount}カメラ）
              </Typography>
              {cameraNames.length === 0 ? (
                <Typography color="text.secondary">カメラ構成が取得できません。</Typography>
              ) : (
                <CameraGrid
                  cameraNames={cameraNames}
                  statusByName={statusByName}
                />
              )}
              <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  最新のロット判定
                </Typography>
                <SectionSummary latestLot={latest} lotStatus={lotStatus} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )
    }

    return (
      <Grid container spacing={3}>
        {['バネ留め', 'A層'].map(renderRealtimeCard)}
      </Grid>
    )
  }

  // 各セクションタブの内容（propsで必要な関数や状態を渡す）
  const renderSectionTab = (section) => (
    <SectionTab
      section={section}
      getSectionLots={getSectionLots}
      getLotStatus={getLotStatus}
      getLotShotsByCamera={getLotShotsByCamera}
      ensureLotShotsLoaded={ensureLotShotsLoaded}
      getSectionStats={getSectionStats}
      getFailReasons={getFailReasons}
      lightbox={lightbox}
      setLightbox={setLightbox}
      getLatestLot={getLatestLot}
      getAvailableDates={getAvailableDates}
      selectedLotId={selectedLotId}
      selectedLotInfo={selectedLotInfo}
      onOpenLot={handleOpenLot}
      onCloseLot={handleCloseLot}
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
