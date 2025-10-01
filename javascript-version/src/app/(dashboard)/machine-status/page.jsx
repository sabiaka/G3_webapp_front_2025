'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

import { UnitStatusLamps } from '@components/machine-status/components/UnitStatusLamps'
import { ErrorLogList } from '@components/machine-status/components/ErrorLogList'
import { InspectionDialog, IntervalDialog } from '@components/machine-status/components/InspectionDialogs'
import { useMachineInfo } from '@components/machine-status/hooks/useMachineInfo'
import { useMachineLogs } from '@components/machine-status/hooks/useMachineLogs'
import { formatYmdSlash, secondsToHMS } from '@components/machine-status/utils/date'

const machineInfo = { image: '/images/projectpic/image.png' }

const MachineStatus = () => {
  // APIの{id}は固定でこの機械名を使用
  const machineId = '半自動表層バネどめ機'

  const [logType, setLogType] = useState('すべて')
  const [logDate, setLogDate] = useState('')

  // --- 機械基本情報（/api/machines/{id}） ---
  const {
    machineName,
    todayUptimeHms,
    todayProductionCount,
    machineDataLoading,
    machineDataError,
    uptimeSeconds,
    setLastInspectionDate,
    lastInspectionDate,
    inspectionIntervalDays,
    setInspectionIntervalDays,
    nextInspectionDate,
    defaultInfo,
  } = useMachineInfo(machineId)

  const { processedLogs, loading, fetchError, isFallbackData, unitStatuses, globalStatusLabel } = useMachineLogs(machineId)

  // ダイアログ管理
  const [openInspection, setOpenInspection] = useState(false)
  const [openInterval, setOpenInterval] = useState(false)
  const [savingInterval, setSavingInterval] = useState(false)
  const [completingInspection, setCompletingInspection] = useState(false)

  // スナックバー
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const showSnack = (message, severity = 'success') => setSnackbar({ open: true, message, severity })
  const closeSnack = () => setSnackbar(s => ({ ...s, open: false }))
  // フィルタ適用
  const filteredLogs = useMemo(() => {
    return processedLogs.filter((log) => {
      const typeMatch = logType === 'すべて' || log.type === logType
      const dateMatch = !logDate || log.date === logDate
      return typeMatch && dateMatch
    })
  }, [processedLogs, logType, logDate])

  // ログリストの初期高さを固定して、以降はスクロールに切り替え（縦に伸びない）
  const logListRef = useRef(null)
  const [logListMaxHeight, setLogListMaxHeight] = useState(null)
  useEffect(() => {
    if (!logListRef.current || logListMaxHeight != null) return
    // 次フレームで計測して初期高さをロック
    const rAF = requestAnimationFrame(() => {
      const h = logListRef.current?.getBoundingClientRect().height
      if (h && h > 0) setLogListMaxHeight(h)
    })
    return () => cancelAnimationFrame(rAF)
  }, [logListMaxHeight])

  // 左カラム(Card)の高さを監視して右カラムに反映
  const leftCardRef = useRef(null)
  const [leftCardHeight, setLeftCardHeight] = useState(null)
  useEffect(() => {
    if (!leftCardRef.current || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(entries => {
      const entry = entries[0]
      if (!entry) return
      const h = entry.contentRect.height
      if (h && h > 0) setLeftCardHeight(h)
    })
    ro.observe(leftCardRef.current)
    return () => ro.disconnect()
  }, [])


  // ここから描画

  // ユニット状態から全体ステータスを集約（優先度: エラー > 警告 > 不明 > 正常）
  const overallStatus = useMemo(() => {
    const values = [...Object.values(unitStatuses), globalStatusLabel]
    const hasError = values.some(v => v === 'エラー' || v === '残弾なし')
    const hasWarn = values.some(v => v === '残弾わずか')
    const hasUnknown = values.some(v => v === '不明')
    const hasStopped = values.some(v => v === '停止中')

    if (hasError) return { label: 'エラー', color: 'error' }
    if (hasStopped) return { label: '停止中', color: 'default' }
    if (hasWarn) return { label: '警告', color: 'warning' }
    if (hasUnknown) return { label: '不明', color: 'default' }
    return { label: '正常に稼働中', color: 'success' }
  }, [unitStatuses, globalStatusLabel])

  return (
    <>
    <Grid container spacing={6}>
      {/* タイトル・戻るリンク */}
      {/* <Typography variant='h4' sx={{ mb: 0, fontWeight: 700 }}>生産機械ステータス</Typography> */}

      {/* 2カラムレイアウト */}
      <Grid item xs={12}>
        <Grid container spacing={4}>
          {/* 左カラム: 機械画像・状態 */}
          <Grid item xs={12} md={5}>
            <Card ref={leftCardRef} sx={{ mb: 4, height: '100%' }}>
              <CardContent>
                <Typography variant='h6' fontWeight='bold' mb={2}>{machineName}</Typography>
                <Box
                  sx={{
                    width: '100%',
                    borderRadius: 2,
                    overflow: 'hidden',
                    mb: 2,
                    bgcolor: 'grey.100',
                  }}
                >
                  <img
                    src={machineInfo.image}
                    alt={machineName}
                    style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                  />
                </Box>
                <UnitStatusLamps unitStatuses={unitStatuses} />
                <Chip
                  label={overallStatus.label}
                  color={overallStatus.color}
                  sx={{ width: '100%', fontSize: 18, py: 2, fontWeight: 'bold' }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* 右カラム: 稼働データ・エラーログ */}
          <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column', height: '100%', ...(leftCardHeight ? { height: leftCardHeight } : {}) }}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Box display='flex' alignItems='center' justifyContent='space-between' mb={2} gap={2}>
                  <Typography variant='h6' fontWeight='bold'>稼働データ</Typography>
                  <Box display='flex' gap={1} flexWrap='wrap'>
                    <Button variant='contained' color='primary' onClick={() => setOpenInspection(true)}>
                      点検
                    </Button>
                    <Button variant='outlined' color='secondary' onClick={() => setOpenInterval(true)}>
                      点検期間変更
                    </Button>
                    {machineDataLoading && <CircularProgress size={18} />}
                  </Box>
                </Box>
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={6} sm={3}>
                    <Box bgcolor='grey.50' p={2} borderRadius={2} textAlign='center'>
                      <Typography variant='body2' color='text.secondary'>本日の稼働時間</Typography>
                      <Typography variant='h5' fontWeight='bold'>
                        {uptimeSeconds != null ? secondsToHMS(uptimeSeconds) : (todayUptimeHms || defaultInfo.todayWorkTime)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box bgcolor='grey.50' p={2} borderRadius={2} textAlign='center'>
                      <Typography variant='body2' color='text.secondary'>本日の生産数</Typography>
                      <Typography variant='h5' fontWeight='bold'>
                        {todayProductionCount != null ? `${todayProductionCount.toLocaleString()}個` : defaultInfo.todayProduction}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box bgcolor='grey.50' p={2} borderRadius={2} textAlign='center'>
                      <Typography variant='body2' color='text.secondary'>最終点検日</Typography>
                      <Typography variant='h5' fontWeight='bold'>{formatYmdSlash(lastInspectionDate)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box bgcolor='grey.50' p={2} borderRadius={2} textAlign='center'>
                      <Typography variant='body2' color='text.secondary'>次回点検日</Typography>
                      <Typography variant='h5' fontWeight='bold'>{formatYmdSlash(nextInspectionDate)}</Typography>
                    </Box>
                  </Grid>
                </Grid>
                {machineDataError && (
                  <Typography variant='caption' color='warning.main'>
                    {machineDataError}
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* エラーログ */}
            <Card sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <Box display='flex' flexDirection={{ xs: 'column', sm: 'row' }} justifyContent='space-between' alignItems={{ xs: 'flex-start', sm: 'center' }} mb={2} gap={2}>
                  <Typography variant='h6' fontWeight='bold'>エラーログ</Typography>
                  <Box display='flex' gap={2} alignItems='center'>
                    <TextField
                      type='date'
                      size='small'
                      value={logDate}
                      onChange={e => setLogDate(e.target.value)}
                      sx={{ minWidth: 140 }}
                    />
                    <TextField
                      select
                      size='small'
                      value={logType}
                      onChange={e => setLogType(e.target.value)}
                      sx={{ minWidth: 100 }}
                    >
                      <MenuItem value='すべて'>すべて</MenuItem>
                      <MenuItem value='エラー'>エラー</MenuItem>
                      <MenuItem value='警告'>警告</MenuItem>
                      <MenuItem value='情報'>情報</MenuItem>
                    </TextField>
                    {loading && <CircularProgress size={20} />}
                  </Box>
                </Box>
                {isFallbackData && (
                  <Typography variant='caption' color='warning.main' sx={{ mb: 1 }}>
                    {fetchError || 'ログの取得に失敗しました。サンプルデータで表示しています。'}
                  </Typography>
                )}
                <Divider sx={{ mb: 2 }} />
                <Box ref={logListRef} sx={{ flex: 1, minHeight: 0 }}>
                  <ErrorLogList
                    logs={filteredLogs}
                    maxHeight={leftCardHeight ? `calc(${leftCardHeight}px - 140px)` : (logListMaxHeight || undefined)}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
  </Grid>
  {/* 点検ダイアログ */}
    <InspectionDialog
      open={openInspection}
      onClose={() => setOpenInspection(false)}
      onComplete={async () => {
        try {
          setCompletingInspection(true)
          const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
          const token = (typeof window !== 'undefined' && (localStorage.getItem('access_token') || sessionStorage.getItem('access_token'))) || ''
          const res = await fetch(`${base}/api/machines/${encodeURIComponent(machineId)}/complete-inspection`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          })
          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err?.error || `Failed: ${res.status}`)
          }
          const data = await res.json()
          if (data?.last_inspection_date) {
            setLastInspectionDate(new Date(data.last_inspection_date))
          } else {
            setLastInspectionDate(new Date())
          }
          if (Number.isFinite(Number(data?.inspection_interval_days))) {
            setInspectionIntervalDays(Number(data.inspection_interval_days))
          }
          // 成功時: 進捗クリア
          try { if (typeof window !== 'undefined') localStorage.removeItem('machine-status:inspection-progress') } catch {}
          showSnack('点検を記録しました', 'success')
          setOpenInspection(false)
        } catch (e) {
          showSnack(`点検の記録に失敗しました: ${e?.message || e}`, 'error')
        } finally {
          setCompletingInspection(false)
        }
      }}
    />

    {/* 点検期間変更ダイアログ */}
    <IntervalDialog
      open={openInterval}
      onClose={() => setOpenInterval(false)}
      value={inspectionIntervalDays}
      onChange={(v) => setInspectionIntervalDays(v)}
      nextInspectionDate={nextInspectionDate}
      saving={savingInterval}
      onSave={async (newDays) => {
        try {
          setSavingInterval(true)
          const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
          const token = (typeof window !== 'undefined' && (localStorage.getItem('access_token') || sessionStorage.getItem('access_token'))) || ''
          const res = await fetch(`${base}/api/machines/${encodeURIComponent(machineId)}/inspection-interval`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify({ interval_days: Number(newDays) })
          })
          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err?.error || `Failed: ${res.status}`)
          }
          const data = await res.json()
          if (Number.isFinite(Number(data?.inspection_interval_days))) {
            setInspectionIntervalDays(Number(data.inspection_interval_days))
          }
          if (data?.next_inspection_date) {
            // setLastInspectionDate は不要。次回点検日は派生で再計算されるが、APIの値を優先したい場合は last を逆算ではなく直接 next を表示に使う設計に変更が必要。
            // ここでは UI 仕様に合わせて interval 更新だけで派生計算を継続。
          }
          showSnack('点検間隔を変更しました', 'success')
          setOpenInterval(false)
        } catch (e) {
          showSnack(`点検間隔の変更に失敗しました: ${e?.message || e}`, 'error')
        } finally {
          setSavingInterval(false)
        }
      }}
    />

    <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={closeSnack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert onClose={closeSnack} severity={snackbar.severity} sx={{ width: '100%' }}>
        {snackbar.message}
      </Alert>
    </Snackbar>
    </>
  )
}

export default MachineStatus
