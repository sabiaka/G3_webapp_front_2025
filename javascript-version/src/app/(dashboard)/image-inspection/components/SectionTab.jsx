// 検査セクションごとの統計・最新ロット・履歴テーブルをタブ表示するダッシュボード本体
import { useMemo, useState } from 'react'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

import DonutChart from './DonutChart'
import ImageLightbox from './ImageLightbox'
import SectionSummary from './SectionSummary'
import CameraGrid from './CameraGrid'
import LotCard from './LotCard'
import { SECTION_CONFIG } from '../utils/sectionConfig'
import SurfaceBox from '@/components/surface/SurfaceBox'

const SectionTab = ({
  section,
  getSectionLots,
  getLotStatus,
  getLotShotsByCamera,
  ensureLotShotsLoaded,
  getSectionStats,
  getFailReasons,
  openRows,
  setOpenRows,
  lightbox,
  setLightbox,
  getLatestLot,
  getAvailableDates
}) => {
  // 日付切替（セクション別に）
  const availableDates = useMemo(() => getAvailableDates(section), [getAvailableDates, section])
  const [selectedDateIndex, setSelectedDateIndex] = useState(0)
  const [manualDate, setManualDate] = useState('')
  const selectedDate = manualDate || (availableDates[selectedDateIndex] || undefined)

  const goPrevDate = () => {
    setManualDate('')
    setSelectedDateIndex(i => Math.min(i + 1, Math.max(availableDates.length - 1, 0)))
  }

  const goNextDate = () => {
    setManualDate('')
    setSelectedDateIndex(i => Math.max(i - 1, 0))
  }

  const canGoPrev = selectedDateIndex < (availableDates.length - 1)
  const canGoNext = selectedDateIndex > 0

  const latestLotForSection = getLatestLot(section)
  const latestLotStatus = latestLotForSection ? getLotStatus(latestLotForSection) : undefined
  const latestDate = latestLotForSection?.date
  const statsLatest = getSectionStats(section, latestDate)
  const failReasonsLatest = getFailReasons(section, latestDate)

  const cameraNamesForGrid = useMemo(() => {
    const fromLatest = Array.from(new Set((latestLotForSection?.cameras || []).map(cam => cam?.name).filter(Boolean)))
    const fallback = SECTION_CONFIG[section]?.cameras || []
    return fromLatest.length ? fromLatest : fallback
  }, [latestLotForSection, section])

  const statusByNameForGrid = useMemo(() => {
    const entries = (latestLotForSection?.cameras || [])
      .filter(cam => cam?.name)
      .map(cam => [cam.name, cam.status])
    return Object.fromEntries(entries)
  }, [latestLotForSection])

  const sectionLots = useMemo(
    () => getSectionLots(section, selectedDate),
    [getSectionLots, section, selectedDate],
  )

  const handleToggleRow = lot => {
    const isOpen = !!openRows[lot.lotId]
    const next = !isOpen
    setOpenRows(prev => ({ ...prev, [lot.lotId]: next }))
    if (next && ensureLotShotsLoaded) ensureLotShotsLoaded(lot.lotId)
  }

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8} sx={{ display: 'flex' }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                リアルタイム監視: {section}検査（{cameraNamesForGrid.length}カメラ）
              </Typography>
              {cameraNamesForGrid.length === 0 ? (
                <Typography color="text.secondary">カメラ構成が取得できません。</Typography>
              ) : (
                <CameraGrid cameraNames={cameraNamesForGrid} statusByName={statusByNameForGrid} />
              )}
              <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  最新のロット判定
                </Typography>
                <SectionSummary latestLot={latestLotForSection} lotStatus={latestLotStatus} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4} sx={{ display: 'flex' }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
            <CardContent sx={{ '& > * + *': { mt: 3 } }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  サマリー（最新日）
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <DonutChart percentage={statsLatest.passRate} />
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <SurfaceBox variant="soft" sx={{ p: 1.5, borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">ロット総数</Typography>
                      <Typography variant="h4" fontWeight="bold">{statsLatest.total}</Typography>
                    </SurfaceBox>
                  </Grid>
                  <Grid item xs={4}>
                    <SurfaceBox variant="soft" sx={{ p: 1.5, borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">良品</Typography>
                      <Typography variant="h4" fontWeight="bold" color="success.main">{statsLatest.pass}</Typography>
                    </SurfaceBox>
                  </Grid>
                  <Grid item xs={4}>
                    <SurfaceBox variant="soft" sx={{ p: 1.5, borderRadius: 1, textAlign:  'center' }}>
                      <Typography variant="body2" color="text.secondary">不良品</Typography>
                      <Typography variant="h4" fontWeight="bold" color="error.main">{statsLatest.fail}</Typography>
                    </SurfaceBox>
                  </Grid>
                </Grid>
              </Box>
              <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  不良原因
                </Typography>
                {failReasonsLatest.length === 0 ? (
                  <Typography color="text.secondary">本日の不良品はありません。</Typography>
                ) : (
                  <Box sx={{ '& > * + *': { mt: 2 } }}>
                    {failReasonsLatest.map((reason, index) => (
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
              {section}検査 ロットログ（{selectedDate || '全日'}）
            </Typography>
            {/* 日付ナビゲーション */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <IconButton size="small" onClick={goPrevDate} disabled={!canGoPrev} aria-label="prev date">
                <ChevronLeftIcon />
              </IconButton>
              <TextField
                type="date"
                size="small"
                value={selectedDate || ''}
                onChange={(e) => {
                  const v = e.target.value

                  setManualDate(v)
                  const idx = availableDates.indexOf(v)

                  if (idx >= 0) setSelectedDateIndex(idx)
                }}
                inputProps={{ max: availableDates[0] || undefined }}
                sx={{ minWidth: 160 }}
              />
              <IconButton size="small" onClick={goNextDate} disabled={!canGoNext} aria-label="next date">
                <ChevronRightIcon />
              </IconButton>
              <Box sx={{ flex: 1 }} />
              {availableDates.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {selectedDateIndex + 1}/{availableDates.length}
                </Typography>
              )}
            </Box>
            <Box>
              {sectionLots.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  表示できるロットがありません。
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {sectionLots.map(lot => {
                    const isOpen = !!openRows[lot.lotId]
                    const shotsByCam = getLotShotsByCamera(lot.lotId)

                    return (
                      <Grid item xs={12} md={6} xl={4} key={lot.lotId}>
                        <LotCard
                          lot={lot}
                          lotStatus={getLotStatus(lot)}
                          isExpanded={isOpen}
                          onToggle={() => handleToggleRow(lot)}
                          shotsByCamera={shotsByCam}
                          setLightbox={setLightbox}
                        />
                      </Grid>
                    )
                  })}
                </Grid>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
      {/* Lightbox */}
      <ImageLightbox
        open={lightbox.open}
        src={lightbox.src}
        fallbackSrc={lightbox.fallback}
        alt={lightbox.alt}
        onClose={() => setLightbox({ open: false, src: '', fallback: '', alt: '' })}
      />
    </>
  )
}

export default SectionTab
