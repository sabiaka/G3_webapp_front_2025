"use client"

import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import useSignageData from '../components/useSignageData'
import MachineStatusPanel from '../components/MachineStatusPanel'
import InspectionPanel from '../components/InspectionPanel'
import SpringMapPanel from '../components/SpringMapPanel' // 作成したコンポーネントをインポート
import DebugControls from '../components/DebugControls'
import AlertOverlay from '../components/AlertOverlay'

// SSEのエンドポイント
const SSE_URL = '/api/sse' 

const Page = () => {
  const data = useSignageData()
  
  // 表示切り替え用のステート (false: 検査画像, true: マップ)
  const [showMap, setShowMap] = useState(false)
  
  // マップ用の最新データステート（初期値はダミー）
  const [mapData, setMapData] = useState({
    spring1: 'ok', spring2: 'ng', spring3: 'ng', spring4: 'ng'
  })

  // 10秒ごとに表示を切り替えるタイマー
  useEffect(() => {
    const timer = setInterval(() => {
      setShowMap((prev) => !prev)
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  // SSE (Server-Sent Events) の接続設定
  useEffect(() => {
    if (typeof window === 'undefined' || !window.EventSource) return

    const eventSource = new EventSource(SSE_URL)

    // 接続確認
    eventSource.addEventListener('sse:connected', (e) => {
      console.log('SSE Connected')
    })

    // 新しいデータが来た時の処理
    const handleUpdate = (event) => {
      console.log('New data received:', event.type)
      
      // ここで useSignageData のデータを再取得（SWRのmutate等があればそれを呼ぶ）
      // data.mutate?.() 

      // もしSSEのイベントデータ自体に判定結果が含まれているならここで setMapData を更新できます
      // 例: JSON.parse(event.data) して mapData にセットするなど
    }

    eventSource.addEventListener('inspection:imageUploaded', handleUpdate)
    eventSource.addEventListener('inspection:resultUpdated', handleUpdate)
    eventSource.addEventListener('machine:started', handleUpdate)

    return () => {
      eventSource.close()
    }
  }, [])

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', fontSize: '125%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ px: 4, py: 3, flexShrink: 0 }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Box>
            <Typography variant='h3' fontWeight={900} letterSpacing={2} sx={{ fontSize: { xs: '2.75rem', md: '3.25rem' } }}>工場ダッシュボード</Typography>
            <DebugControls onError={data.onDebugError} onWarning={data.onDebugWarning} onNormal={data.onDebugNormal} />
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant='h3' fontWeight={800} sx={{ fontSize: { xs: '2.75rem', md: '3.25rem' } }}>{data.clock.time}</Typography>
            <Typography variant='h5' color='text.secondary' sx={{ fontSize: { xs: '1.75rem', md: '2rem' } }}>{data.clock.date}</Typography>
          </Box>
        </Stack>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ px: 4, pb: 4, flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
        <Grid container spacing={4} sx={{ height: '100%' }}>
          
          {/* Machine status (Left Column) */}
          <Grid item xs={12} xl={4} sx={{ height: '100%' }}>
            <MachineStatusPanel
              machineName={data.machineName}
              machineBadge={data.machineBadge}
              todayUptimeSec={data.todayUptimeSec}
              todayProdCount={data.todayProdCount}
              logs={data.logs}
              formatNumber={data.formatNumber}
            />
          </Grid>

          {/* Right Column (Inspection + Map + Stats) */}
          <Grid item xs={12} xl={8} sx={{ height: '100%' }}>
            <Stack spacing={4} sx={{ height: '100%' }}>
              
              {/* 表示切り替えエリア (flexGrow: 1 で残りの高さを占有) */}
              <Box sx={{ flexGrow: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
                
                {/* 1. 検査画像パネル */}
                <Box sx={{ 
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  opacity: showMap ? 0 : 1, // 透明度で切り替えるとフェード効果もつけやすい
                  transition: 'opacity 0.5s ease-in-out',
                  pointerEvents: showMap ? 'none' : 'auto', // 裏にある時はクリック無効化
                  zIndex: showMap ? 0 : 1
                }}>
                  <InspectionPanel overallStatus={data.overallStatus} tiles={data.tiles} />
                </Box>

                {/* 2. ばねどめ検査マップ */}
                <Box sx={{ 
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  opacity: showMap ? 1 : 0,
                  transition: 'opacity 0.5s ease-in-out',
                  zIndex: showMap ? 1 : 0
                }}>
                  {/* dataプロパティには実際の最新判定結果を渡してください */}
                  <SpringMapPanel data={mapData} />
                </Box>

              </Box>

              {/* Stats (Bottom Fixed Height) */}
              <Grid container spacing={3} sx={{ flexShrink: 0 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant='body1' color='text.secondary' sx={{ fontSize: '1.1rem' }}>rot_id</Typography>
                    <Typography variant='h4' fontWeight={700} sx={{ fontSize: { xs: '2.2rem', md: '2.5rem' } }}>{data.rotId || '---'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant='body1' color='text.secondary' sx={{ fontSize: '1.1rem' }}>検査時間</Typography>
                    <Typography variant='h4' fontWeight={700} sx={{ fontSize: { xs: '2.2rem', md: '2.5rem' } }}>{data.inspectionTime}</Typography>
                  </Box>
                </Grid>
              </Grid>

            </Stack>
          </Grid>
        </Grid>
      </Box>

      <AlertOverlay alert={data.alert} />
    </Box>
  )
}

export default Page