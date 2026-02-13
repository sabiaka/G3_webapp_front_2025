"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import useSignageData from '../components/useSignageData'
import MachineStatusPanel from '../components/MachineStatusPanel'
import InspectionPanel from '../components/InspectionPanel'
import SpringMapPanel from '../components/SpringMapPanel'
import DebugControls from '../components/DebugControls'
import AlertOverlay from '../components/AlertOverlay'

// SSEのエンドポイント
const SSE_URL = '/api/sse' 

const Page = () => {
  const router = useRouter()
  const data = useSignageData()
  
  // 表示切り替え用ステート (false: 検査画像, true: マップ)
  const [showMap, setShowMap] = useState(false)
  
  // 10秒ごとに表示を切り替えるタイマー
  useEffect(() => {
    const timer = setInterval(() => {
      setShowMap((prev) => !prev)
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  // ★★★ SSE (リアルタイム自動更新) の設定 ★★★
  useEffect(() => {
    if (typeof window === 'undefined' || !window.EventSource) return

    const eventSource = new EventSource(SSE_URL)

    // 新しいデータが来た時の処理
    const handleUpdate = (event) => {
      console.log('Update signal received:', event.type)
      
      // ★修正ポイント: 即座にリロードせず、1秒 (1000ms) 待つ！
      // これにより、DBへの書き込みが完了した「確実な最新データ」を取得できます。
      // 「画像検査ステータス画面」で見ているのと同じ、書き込み完了後のデータを表示するために必須です。
      setTimeout(() => {
        console.log('Executing refresh...')
        router.refresh() 
        
        // もしrouter.refresh()だけで画面が変わらない場合（キャッシュが強い場合）の保険
        // window.location.reload() 
      }, 1000) 
    }

    eventSource.addEventListener('sse:connected', () => console.log('SSE Connected'))
    
    // イベント受信設定
    eventSource.addEventListener('inspection:imageUploaded', handleUpdate)
    eventSource.addEventListener('inspection:resultUpdated', handleUpdate)
    eventSource.addEventListener('machine:started', handleUpdate)

    return () => {
      eventSource.close()
    }
  }, [router])

  // --- データ変換ロジック ---
  // data.tiles (最新ログ) の内容をマップ用のステータスに変換
  const getSpringStatus = (suffix) => {
    if (!data.tiles || !Array.isArray(data.tiles)) return 'idle'
    
    // カメラID (B-spring01等) の末尾でマッチング
    const tile = data.tiles.find(t => t.cameraId && t.cameraId.endsWith(suffix))
    
    if (!tile) return 'idle'
    if (tile.status === 'PASS') return 'ok'
    if (tile.status === 'FAIL') return 'ng'
    return 'idle'
  }

  // マップに渡すデータを作成
  const mapData = {
    spring1: getSpringStatus('01'),
    spring2: getSpringStatus('02'),
    spring3: getSpringStatus('03'),
    spring4: getSpringStatus('04'),
  }

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
          
          {/* 左カラム: 機械状況 */}
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

          {/* 右カラム: 画像検査 & マップ */}
          <Grid item xs={12} xl={8} sx={{ height: '100%' }}>
            <Stack spacing={4} sx={{ height: '100%' }}>
              
              {/* 表示切り替えエリア (10秒ごとに画像とマップが入れ替わる) */}
              <Box sx={{ flexGrow: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
                
                {/* 1. 画像検査パネル */}
                <Box sx={{ 
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  opacity: showMap ? 0 : 1, 
                  transition: 'opacity 0.5s ease-in-out',
                  pointerEvents: showMap ? 'none' : 'auto',
                  zIndex: showMap ? 0 : 1
                }}>
                  <InspectionPanel overallStatus={data.overallStatus} tiles={data.tiles} />
                </Box>

                {/* 2. マップ */}
                <Box sx={{ 
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  opacity: showMap ? 1 : 0,
                  transition: 'opacity 0.5s ease-in-out',
                  zIndex: showMap ? 1 : 0
                }}>
                  <SpringMapPanel data={mapData} />
                </Box>

              </Box>

              {/* 下部ステータス (rot_id, 検査時間) */}
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