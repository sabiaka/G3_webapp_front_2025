'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'

const errorLogSample = [
  {
    type: 'エラー',
    code: 'E-102',
    title: 'トルク過負荷',
    desc: 'モーターの負荷が規定値を超えました。',
    date: '2025-07-15',
    time: '10:15:32',
    color: 'error',
  },
  {
    type: '警告',
    code: 'W-05',
    title: '潤滑油低下',
    desc: '潤滑油が規定レベルを下回っています。',
    date: '2025-07-15',
    time: '09:30:11',
    color: 'warning',
  },
  {
    type: '情報',
    code: 'I-001',
    title: '起動シーケンス完了',
    desc: '',
    date: '2025-07-15',
    time: '08:00:05',
    color: 'default',
  },
  {
    type: 'エラー',
    code: 'E-201',
    title: 'センサー接続エラー',
    desc: 'センサー#3との通信がタイムアウトしました。',
    date: '2025-07-14',
    time: '15:45:01',
    color: 'error',
  },
  {
    type: '警告',
    code: 'W-02',
    title: 'フィルター交換時期',
    desc: 'エアフィルターの交換を推奨します。',
    date: '2025-07-14',
    time: '11:20:45',
    color: 'warning',
  },
  {
    type: '情報',
    code: 'I-002',
    title: '生産完了 (Lot-24B)',
    desc: '',
    date: '2025-07-14',
    time: '17:30:00',
    color: 'default',
  },
]

const machineInfo = {
  name: '自動表層バネどめ機',
  image: '/images/projectpic/image.png',
  status: '正常に稼働中',
  statusColor: 'success',
  todayWorkTime: '8時間 25分',
  todayProduction: '1,520個',
  lastInspection: '2024/06/15',
  nextInspection: '2024/09/15',
}

const statusColorMap = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
  default: 'default',
}

const MachineStatus = () => {
  // APIの{id}は固定でこの機械名を使用
  const machineId = '半自動表層バネどめ機'

  const [logType, setLogType] = useState('すべて')
  const [logDate, setLogDate] = useState('')
  // API ログ
  const [apiLogs, setApiLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [isFallbackData, setIsFallbackData] = useState(false)
  // unit未指定(全体)のログから導く大ランプ用ステータス
  const [globalStatusLabel, setGlobalStatusLabel] = useState('正常稼働')

  // ユニット ステータス（ログから自動判定）
  const [unitStatuses, setUnitStatuses] = useState({
    Unit1: '正常稼働',
    Unit2: '正常稼働',
    Unit3: '正常稼働',
    Unit4: '正常稼働',
  })

  const unitLampColorMap = {
    残弾わずか: 'warning',
    残弾なし: 'error',
    正常稼働: 'success',
    エラー: 'error',
    不明: 'default',
  }

  // API からログ取得（API設計: GET /api/machines/{id}/logs）
  useEffect(() => {
    const controller = new AbortController()
    const fetchLogs = async () => {
      try {
        setLoading(true)
        setFetchError('')
        const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
        const token =
          (typeof window !== 'undefined' && (localStorage.getItem('access_token') || sessionStorage.getItem('access_token'))) || ''

        // フィルタに依存せず最新のログ束を取得（表示はクライアントで絞り込む）
        const qs = new URLSearchParams()
        qs.set('page', '1')
        qs.set('limit', '200')

        const url = `${base}/api/machines/${encodeURIComponent(machineId)}/logs?${qs.toString()}`

        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`Failed to fetch logs: ${res.status}`)
        const data = await res.json()
        const logs = Array.isArray(data?.logs) ? data.logs : []
        setApiLogs(logs)
        setIsFallbackData(false)
        setFetchError('')
      } catch (err) {
        // 失敗時はサンプルをフォールバックとして利用（ユニット判定は継続できるよう fetchError はUI表示専用に）
        setFetchError('ログの取得に失敗しました。サンプルデータで表示しています。')
        const fallback = errorLogSample.map((s, idx) => ({
          log_id: 1000 + idx,
          unit_id: null,
          timestamp: `${s.date}T${s.time}Z`,
          log_type: s.color === 'error' ? 'error' : s.color === 'warning' ? 'warning' : 'info',
          title: `${s.code}: ${s.title}`,
          message: s.desc || '',
        }))
        setApiLogs(fallback)
        setIsFallbackData(true)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
    return () => controller.abort()
  }, [])

  // ログの表示用に加工（フィルタ/整形）
  const processedLogs = useMemo(() => {
    const toDateOnly = (iso) => {
      try {
        const d = new Date(iso)
        // YYYY-MM-DD
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const da = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${da}`
      } catch {
        return ''
      }
    }
    const toTime = (iso) => {
      try {
        const d = new Date(iso)
        const hh = String(d.getHours()).padStart(2, '0')
        const mm = String(d.getMinutes()).padStart(2, '0')
        const ss = String(d.getSeconds()).padStart(2, '0')
        return `${hh}:${mm}:${ss}`
      } catch {
        return ''
      }
    }
    const mapColor = t => (t === 'error' ? 'error' : t === 'warning' ? 'warning' : 'default')
    const mapTypeJp = t => (t === 'error' ? 'エラー' : t === 'warning' ? '警告' : '情報')

    return apiLogs
      .slice()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(l => {
        const code = (l.title || '').split(':')[0] || ''
        return {
          type: mapTypeJp(l.log_type),
          code,
          title: (l.title || '').split(':').slice(1).join(':').trim() || l.title || '',
          desc: l.message || '',
          date: toDateOnly(l.timestamp),
          time: toTime(l.timestamp),
          color: mapColor(l.log_type),
          unitId: l.unit_id,
        }
      })
  }, [apiLogs])

  // フィルタ適用
  const filteredLogs = useMemo(() => {
    return processedLogs.filter(log => {
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

  // 最新ログからユニットの状態を推定（UIのフィルタ値とは独立して apiLogs を参照）
  useEffect(() => {
    // 取得失敗かつログが空のときのみユニットランプを「不明」に固定
    if (fetchError && (!apiLogs || apiLogs.length === 0)) {
      setUnitStatuses({ Unit1: '不明', Unit2: '不明', Unit3: '不明', Unit4: '不明' })
      setGlobalStatusLabel('不明')
      return
    }
    const extractCode = (title) => {
      const m = (title || '').match(/([A-Z]-\d{3})/)
      return m?.[1] || ''
    }

    // エラーコード → ユニットランプ状態マッピング
    // ご提示の一覧に基づく
    const codeToStatus = {
      'E-001': '正常稼働', // 非常停止ボタン作動は正常扱い
      'E-002': '残弾なし', // 致命的低下
      'E-003': 'エラー',   // 点検時期 超過
      'E-099': 'エラー',   // その他 致命的停止
      'W-001': '残弾わずか', // 残弾数 低下
      'W-002': '残弾わずか', // 点検時期 間近（警告扱い）
      'W-099': '残弾わずか', // その他 軽微なエラー
      'I-001': '正常稼働',
      'I-002': '正常稼働',
      'I-003': '正常稼働',
    }

    const determineStatusFromLog = (l) => {
      if (!l) return '正常稼働'
      const code = extractCode(l.title)
      if (code && codeToStatus[code]) return codeToStatus[code]

      // コードが未知の場合のフォールバック
      if (l.log_type === 'error') return 'エラー'
      if (l.log_type === 'warning') return '残弾わずか'
      return '正常稼働'
    }

    // ユニット毎に最新ログを抽出（1〜4）
    const latestByUnit = { 1: null, 2: null, 3: null, 4: null }
    apiLogs.forEach(l => {
      if (l.unit_id == null) return
      if (!(l.unit_id in latestByUnit)) return
      if (!latestByUnit[l.unit_id] || new Date(l.timestamp) > new Date(latestByUnit[l.unit_id].timestamp)) {
        latestByUnit[l.unit_id] = l
      }
    })

    // 最新の I-002 (PLC スタンバイ) の時刻を取得（unit_id 無視で全体から）
    let latestI002Ts = null
    apiLogs.forEach(l => {
      const c = extractCode(l.title)
      if (c === 'I-002') {
        const ts = new Date(l.timestamp)
        if (!latestI002Ts || ts > latestI002Ts) latestI002Ts = ts
      }
    })

    const calcWithResetRule = (unitIdx) => {
      const latest = latestByUnit[unitIdx]
      let status = determineStatusFromLog(latest)
      // 残弾エラー/警告の後に I-002 が来ていれば正常に戻す
      if (latest && latestI002Ts && (status === '残弾なし' || status === '残弾わずか')) {
        const unitTs = new Date(latest.timestamp)
        if (latestI002Ts > unitTs) status = '正常稼働'
      }
      return status
    }

    let next = {
      Unit1: calcWithResetRule(1),
      Unit2: calcWithResetRule(2),
      Unit3: calcWithResetRule(3),
      Unit4: calcWithResetRule(4),
    }

    // まれに対象ユニットのログが全く無い場合のフォールバック
    const vals = Object.values(next)
    const allEmpty = vals.every(v => !v)
    if (allEmpty) {
      next = { Unit1: '不明', Unit2: '不明', Unit3: '不明', Unit4: '不明' }
    }
    setUnitStatuses(next)

    // --- unit未指定(全体)ログで大ランプにも反映 ---
    // 最新の unit_id が null のログを取得
    let latestGlobal = null
    apiLogs.forEach(l => {
      if (l.unit_id != null) return
      if (!latestGlobal || new Date(l.timestamp) > new Date(latestGlobal.timestamp)) {
        latestGlobal = l
      }
    })

    let globalLabel = '正常稼働'
    if (latestGlobal) {
      let gs = determineStatusFromLog(latestGlobal) // 'エラー' | '残弾なし' | '残弾わずか' | '正常稼働'
      if (latestI002Ts && (gs === '残弾なし' || gs === '残弾わずか')) {
        const gts = new Date(latestGlobal.timestamp)
        if (latestI002Ts > gts) gs = '正常稼働'
      }
      // 大ランプ用に正規化
      if (gs === 'エラー' || gs === '残弾なし') globalLabel = 'エラー'
      else if (gs === '残弾わずか') globalLabel = '警告'
      else globalLabel = '正常稼働'
    } else if (fetchError && (!apiLogs || apiLogs.length === 0)) {
      globalLabel = '不明'
    }
    setGlobalStatusLabel(globalLabel)
  }, [apiLogs, fetchError])

  // ここから描画

  // ユニット状態から全体ステータスを集約（優先度: エラー > 警告 > 不明 > 正常）
  const overallStatus = useMemo(() => {
    const values = [...Object.values(unitStatuses), globalStatusLabel]
    const hasError = values.some(v => v === 'エラー' || v === '残弾なし')
    const hasWarn = values.some(v => v === '残弾わずか')
    const hasUnknown = values.some(v => v === '不明')

    if (hasError) return { label: 'エラー', color: 'error' }
    if (hasWarn) return { label: '警告', color: 'warning' }
    if (hasUnknown) return { label: '不明', color: 'default' }
    return { label: '正常に稼働中', color: 'success' }
  }, [unitStatuses, globalStatusLabel])

  return (
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
                <Typography variant='h6' fontWeight='bold' mb={2}>{machineInfo.name}</Typography>
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
                    alt={machineInfo.name}
                    style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                  />
                </Box>
                {/* ユニット ステータスランプ（Unit1〜Unit4） */}
                <Box mb={2}>
                  <Typography variant='subtitle2' color='text.secondary' mb={1}>
                    ユニット ステータス
                  </Typography>
                  <Grid container spacing={1.5}>
                    {['Unit1', 'Unit2', 'Unit3', 'Unit4'].map(unit => (
                      <Grid item xs={6} key={unit}>
                        <Box
                          display='flex'
                          alignItems='center'
                          justifyContent='flex-start'
                          p={1.25}
                          borderRadius={1.5}
                          sx={{
                            bgcolor: 'grey.50',
                            border: theme => `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          <Box display='flex' alignItems='center' gap={1.25}>
                            <Typography variant='body2' fontWeight={600} minWidth={48}>
                              {unit}
                            </Typography>
                            <Box display='flex' alignItems='center' gap={0.75}>
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  bgcolor: theme =>
                                    theme.palette[unitLampColorMap[unitStatuses[unit]]]?.main || theme.palette.text.disabled,
                                  boxShadow: theme => `0 0 0 2px ${theme.palette.background.paper}`,
                                }}
                              />
                              <Typography variant='caption' color='text.secondary'>
                                {unitStatuses[unit]}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
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
                <Typography variant='h6' fontWeight='bold' mb={2}>稼働データ</Typography>
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={6} sm={3}>
                    <Box bgcolor='grey.50' p={2} borderRadius={2} textAlign='center'>
                      <Typography variant='body2' color='text.secondary'>本日の稼働時間</Typography>
                      <Typography variant='h5' fontWeight='bold'>{machineInfo.todayWorkTime}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box bgcolor='grey.50' p={2} borderRadius={2} textAlign='center'>
                      <Typography variant='body2' color='text.secondary'>本日の生産数</Typography>
                      <Typography variant='h5' fontWeight='bold'>{machineInfo.todayProduction}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box bgcolor='grey.50' p={2} borderRadius={2} textAlign='center'>
                      <Typography variant='body2' color='text.secondary'>最終点検日</Typography>
                      <Typography variant='h5' fontWeight='bold'>{machineInfo.lastInspection}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box bgcolor='grey.50' p={2} borderRadius={2} textAlign='center'>
                      <Typography variant='body2' color='text.secondary'>次回点検日</Typography>
                      <Typography variant='h5' fontWeight='bold'>{machineInfo.nextInspection}</Typography>
                    </Box>
                  </Grid>
                </Grid>
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
                <Box
                  ref={logListRef}
                  sx={{
                    flex: 1,
                    overflowY: 'auto',
                    minHeight: 0,
                    // 左カラム高さが取れている場合は、右カラム固定高 - フィルタ行/ヘッダなどの概算を差し引き
                    ...(leftCardHeight ? { maxHeight: `calc(${leftCardHeight}px - 140px)` } : {}),
                    // 左が未取得の間は初期高さ固定にフォールバック
                    ...(!leftCardHeight && logListMaxHeight ? { maxHeight: logListMaxHeight } : {}),
                  }}
                >
                  {filteredLogs.length === 0 ? (
                    <Box textAlign='center' py={6} color='text.secondary'>
                      <span className='material-icons' style={{ fontSize: 48, color: '#bdbdbd' }}>sentiment_dissatisfied</span>
                      <Typography variant='body1' mt={2}>該当するログが見つかりませんでした。</Typography>
                    </Box>
                  ) : (
                    filteredLogs.map((log, idx) => (
                      <Box
                        key={idx}
                        display='flex'
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        justifyContent='space-between'
                        bgcolor={
                          log.color === 'error' ? 'error.lighter' :
                          log.color === 'warning' ? 'warning.lighter' :
                          log.color === 'default' ? 'grey.100' : 'info.lighter'
                        }
                        borderRadius={2}
                        px={2}
                        py={1.5}
                        mb={1.5}
                      >
                        <Box pr={2}>
                          <Typography fontWeight='bold' color={
                            log.color === 'error' ? 'error.main' :
                            log.color === 'warning' ? 'warning.main' :
                            log.color === 'default' ? 'text.primary' : 'info.main'
                          }>
                            {log.code}: {log.title}
                          </Typography>
                          {log.desc && (
                            <Typography variant='caption' color={
                              log.color === 'error' ? 'error.dark' :
                              log.color === 'warning' ? 'warning.dark' :
                              'text.secondary'
                            }>
                              {log.desc}
                            </Typography>
                          )}
                          <Box mt={0.5}>
                            <Chip
                              size='small'
                              label={log.unitId ? `Unit${log.unitId}` : '全体'}
                              color={log.unitId ? 'primary' : 'default'}
                              variant={log.unitId ? 'filled' : 'outlined'}
                              sx={{ height: 20, '& .MuiChip-label': { px: 1, fontSize: 11 } }}
                            />
                          </Box>
                        </Box>
                        <Typography variant='body2' color='text.secondary' whiteSpace='nowrap'>
                          {log.date.replace(/-/g, '/')} {log.time}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default MachineStatus
