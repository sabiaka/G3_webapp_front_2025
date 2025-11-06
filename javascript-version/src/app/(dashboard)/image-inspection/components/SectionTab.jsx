import { Fragment, useMemo, useState } from 'react'

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
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import IconButton from '@mui/material/IconButton'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import TextField from '@mui/material/TextField'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

import DonutChart from './DonutChart'
import ImageLightbox from './ImageLightbox'
import SectionSummary from './SectionSummary'
import CameraGrid from './CameraGrid'
import { SECTION_CONFIG } from '../utils/sectionConfig'
import SurfaceBox from '@/components/surface/SurfaceBox'

const SectionTab = ({
  section,
  stats,
  failReasons,
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


  // 最新ロット概要
  const renderLatestLotSummary = () => {
    const latest = getLatestLot(section)
    const lotStatus = latest ? getLotStatus(latest) : undefined

    
return <SectionSummary latestLot={latest} lotStatus={lotStatus} />
  }

  // カメラグリッド
  const renderCameraGrid = () => {
    const latest = getLatestLot(section)
    const names = SECTION_CONFIG[section].cameras
    const statusByName = Object.fromEntries((latest?.cameras || []).map(c => [c.name, c.status]))

    
return <CameraGrid cameraNames={names} statusByName={statusByName} />
  }

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8} sx={{ display: 'flex' }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                リアルタイム監視: {section}検査（{SECTION_CONFIG[section].cameras.length}カメラ）
              </Typography>
              {renderCameraGrid()}
              <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  最新のロット判定
                </Typography>
                {renderLatestLotSummary()}
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
                  {(() => {
                    const latest = getLatestLot(section)
                    const latestDate = latest?.date
                    const statsLatest = getSectionStats(section, latestDate)

                    
return <DonutChart percentage={statsLatest.passRate} />
                  })()}
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <SurfaceBox variant="soft" sx={{ p: 1.5, borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">ロット総数</Typography>
                      {(() => {
                        const latest = getLatestLot(section)
                        const latestDate = latest?.date
                        const statsLatest = getSectionStats(section, latestDate)

                        
return <Typography variant="h4" fontWeight="bold">{statsLatest.total}</Typography>
                      })()}
                    </SurfaceBox>
                  </Grid>
                  <Grid item xs={4}>
                    <SurfaceBox variant="soft" sx={{ p: 1.5, borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">良品</Typography>
                      {(() => {
                        const latest = getLatestLot(section)
                        const latestDate = latest?.date
                        const statsLatest = getSectionStats(section, latestDate)

                        
return <Typography variant="h4" fontWeight="bold" color="success.main">{statsLatest.pass}</Typography>
                      })()}
                    </SurfaceBox>
                  </Grid>
                  <Grid item xs={4}>
                    <SurfaceBox variant="soft" sx={{ p: 1.5, borderRadius: 1, textAlign:  'center' }}>
                      <Typography variant="body2" color="text.secondary">不良品</Typography>
                      {(() => {
                        const latest = getLatestLot(section)
                        const latestDate = latest?.date
                        const statsLatest = getSectionStats(section, latestDate)

                        
return <Typography variant="h4" fontWeight="bold" color="error.main">{statsLatest.fail}</Typography>
                      })()}
                    </SurfaceBox>
                  </Grid>
                </Grid>
              </Box>
              <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  不良原因
                </Typography>
                {(() => {
                  const latest = getLatestLot(section)
                  const latestDate = latest?.date
                  const fr = getFailReasons(section, latestDate)

                  
return fr.length === 0 ? (
                    <Typography color="text.secondary">本日の不良品はありません。</Typography>
                  ) : (
                    <Box sx={{ '& > * + *': { mt: 2 } }}>
                      {fr.map((reason, index) => (
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
                })()}
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
            <TableContainer component={Paper} variant="outlined">
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
                  {getSectionLots(section, selectedDate).map((lot, index) => {
                    const isOpen = !!openRows[lot.lotId]
                    const toggle = () => {
                      const nextOpen = !isOpen
                      setOpenRows(prev => ({ ...prev, [lot.lotId]: nextOpen }))
                      if (nextOpen && ensureLotShotsLoaded) ensureLotShotsLoaded(lot.lotId)
                    }
                    const shotsByCam = getLotShotsByCamera(lot.lotId)
                    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
                    const FALLBACK_IMG = `${basePath}/images/pages/CameraNotFound.png`

                    
return (
                      <Fragment key={lot.lotId}>
                        <TableRow hover onClick={toggle} sx={{ cursor: 'pointer' }} aria-expanded={isOpen}>
                          <TableCell width={56}>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggle() }} aria-label="expand row">
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
                                  label={`${c.name}: ${c.status}`}
                                  size="small"
                                  color={c.status === 'OK' ? 'success' : 'error'}
                                  variant={c.status === 'OK' ? 'outlined' : 'filled'}
                                />
                              ))}
                            </Box>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={5} sx={{ p: 0, bgcolor: 'action.hover' }}>
                            <Collapse in={isOpen} timeout="auto" unmountOnExit>
                              <Box sx={{ px: 3, py: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                  撮影・検査履歴
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Table size="small" aria-label="lot shots table">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>カメラ</TableCell>
                                      <TableCell>結果</TableCell>
                                      <TableCell>詳細</TableCell>
                                      <TableCell align="right">画像</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {Object.entries(shotsByCam).flatMap(([camId, shots]) =>
                                      shots.map((s, i) => (
                                        <TableRow key={`${camId}-${i}`}>
                                          <TableCell sx={{ fontWeight: 500 }}>{camId}</TableCell>
                                          <TableCell>
                                            <Chip label={s.status} size="small" color={s.status === 'PASS' ? 'success' : 'error'} />
                                          </TableCell>
                                          <TableCell>
                                            {s.details || '-'}
                                          </TableCell>
                                          <TableCell align="right" sx={{ width: 220 }}>
                                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                                              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 120 }}>
                                                {s.image_path}
                                              </Typography>
                                              <Box
                                                sx={{ width: 120, aspectRatio: '16/9', borderRadius: 1, overflow: 'hidden', bgcolor: theme => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.200'), cursor: 'pointer' }}
                                                onClick={() => {
                                                  const src = s.image_path ? `${basePath}/${s.image_path}` : `${basePath}/images/pages/CameraNotFound.png`

                                                  setLightbox({ open: true, src, alt: s.image_path || 'shot' })
                                                }}
                                              >
                                                <img
                                                  src={s.image_path || FALLBACK_IMG}
                                                  alt={s.image_path || 'shot'}
                                                  onError={e => {
                                                    if (e.currentTarget.src !== FALLBACK_IMG) e.currentTarget.src = FALLBACK_IMG
                                                  }}
                                                  style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 4 }}
                                                />
                                              </Box>
                                            </Box>
                                          </TableCell>
                                        </TableRow>
                                      ))
                                    )}
                                  </TableBody>
                                </Table>
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
      {/* Lightbox */}
      <ImageLightbox open={lightbox.open} src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox({ open: false, src: '', alt: '' })} />
    </>
  )
}

export default SectionTab
