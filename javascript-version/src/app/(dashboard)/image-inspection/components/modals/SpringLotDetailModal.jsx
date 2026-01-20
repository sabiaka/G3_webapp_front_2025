/*
======== ファイル概要 ========
バネ留め検査向けロット詳細モーダル。代表画像、検査サマリー、カメラ別履歴/テーブル表示を制御する。
*/

import { useCallback, useEffect, useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import { getFallbackImageBase, toAfterTestUrl, toBeforeTestUrl, toImageUrl } from '../../utils/imageUrl'
import ShotsSummaryBlock from '../lots/ShotsSummaryBlock'
import { normalizeShotSummary } from '../../utils/summaryUtils'

const fallbackImageBase = getFallbackImageBase()
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const FALLBACK_IMG = `${basePath}/images/pages/CameraNotFound.png`

/**
 * 画像パスの表記ゆれを取り除き、URL生成に使える形へ整える。
 * @param {string} path - 元のパス。
 * @returns {string|null} 正規化結果。
 */
const normalizeRelativePath = path => {
  if (!path) return null
  const trimmed = String(path).trim()
  if (!trimmed) return null
  const sanitized = trimmed.replace(/\\/g, '/')
  if (/^https?:\/\//i.test(sanitized)) {
    const [protocol, rest] = sanitized.split('://')
    if (!rest) return sanitized
    const cleanedRest = rest.replace(/\/{3,}/g, '//')
    return `${protocol}://${cleanedRest}`
  }
  const withLeading = sanitized.startsWith('/') ? sanitized : `/${sanitized}`
  return withLeading.replace(/\/{3,}/g, '//')
}

/**
 * ステータスに応じたMUI Chipカラーを返す。
 * @param {string} status - 判定。
 * @returns {'success'|'error'|'warning'|'default'} 色指定。
 */
const getChipColor = status => {
  const normalized = (status || '').toString().trim().toUpperCase()
  if (normalized === 'OK' || normalized === 'PASS') return 'success'
  if (normalized === 'NG' || normalized === 'FAIL') return 'error'
  if (normalized === 'MISSING') return 'warning'
  return 'default'
}

/**
 * ロットヘッダー用Chipカラーを計算する。
 * @param {string} status - 判定。
 * @returns {'success'|'error'|'warning'|'default'} 色。
 */
const getLotStatusColor = status => {
  const normalized = (status || '').toString().trim().toUpperCase()
  if (normalized === 'PASS') return 'success'
  if (normalized === 'FAIL') return 'error'
  if (normalized === 'MISSING') return 'warning'
  return 'default'
}

/**
 * 撮影履歴テーブル内のChipカラーを選ぶ。
 * @param {string} status - 判定。
 * @returns {'success'|'error'|'warning'|'default'} 色。
 */
const getShotStatusColor = status => {
  const normalized = (status || '').toString().toUpperCase()
  if (normalized === 'PASS') return 'success'
  if (normalized === 'FAIL') return 'error'
  if (normalized === 'MISSING') return 'warning'
  return 'default'
}

const dummyImageSvg = encodeURIComponent(`
  <svg viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" class="w-full max-w-3xl">
    <g transform="translate(50, 0)">
        <style>
            .title {
                font-size: 28px;
                font-weight: bold;
                font-family: 'Noto Sans JP', sans-serif;
                fill: #3730a3;
            }

            .label {
                font-size: 16px;
                font-family: 'Inter', sans-serif;
                fill: #312e81;
            }

            .camera-box {
                fill: #e0e7ff;
                stroke: #4338ca;
                stroke-width: 6;
                rx: 20;
            }

            .camera-label {
                font-size: 24px;
                font-weight: bold;
                fill: #4338ca;
                text-anchor: middle;
                dominant-baseline: central;
            }

            .center-box {
                fill: #e0e7ff;
                stroke: #4338ca;
                stroke-width: 6;
                rx: 20;
            }

            .center-label {
                font-size: 26px;
                font-weight: bold;
                fill: #4338ca;
                text-anchor: middle;
                dominant-baseline: central;
            }

            .line {
                stroke: #4f46e5;
                stroke-width: 2;
            }
        </style>
        <text x="300" y="40" text-anchor="middle" class="title">バネどめ検査カメラ</text>

        <!-- Center Box -->
        <rect x="120" y="180" width="360" height="150" class="center-box" />
        <text x="300" y="255" class="center-label">押し上げ部</text>

        <!-- Camera 1 (Left) -->
        <g>
            <rect x="40" y="160" width="70" height="190" class="camera-box" />
            <text x="75" y="255" class="camera-label">1</text>
            <!-- <line x1="40" y1="255" x2="-20" y2="255" class="line" /> -->
            <text x="115" y="380" text-anchor="end" class="label">B-spring01</text>
        </g>

        <!-- Camera 2 (Top-Left) -->
        <g>
            <rect x="140" y="90" width="150" height="70" class="camera-box" />
            <text x="215" y="125" class="camera-label">2</text>
            <line x1="215" y1="90" x2="215" y2="70" class="line" />
            <line x1="215" y1="70" x2="120" y2="70" class="line" />
            <text x="110" y="70" text-anchor="end" class="label">B-spring02</text>
        </g>

        <!-- Camera 3 (Top-Right) -->
        <g>
            <rect x="310" y="90" width="150" height="70" class="camera-box" />
            <text x="385" y="125" class="camera-label">3</text>
            <line x1="385" y1="90" x2="385" y2="70" class="line" />
            <line x1="385" y1="70" x2="480" y2="70" class="line" />
            <text x="490" y="70" class="label">B-spring03</text>
        </g>

        <!-- Camera 4 (Right) -->
        <g>
            <rect x="490" y="160" width="70" height="190" class="camera-box" />
            <text x="525" y="255" class="camera-label">4</text>
            <!-- <line x1="560" y1="255" x2="620" y2="255" class="line" /> -->
            <text x="480" y="380" class="label">B-spring04</text>
        </g>
    </g>
</svg>
`)

const DUMMY_SCREENSHOT_SRC = `data:image/svg+xml,${dummyImageSvg}`

/**
 * バネ留めロット詳細モーダル。画像エリアとショット一覧/表を切り替えて表示する。
 * @param {object} props                   - プロパティ集合。
 * @param {boolean} props.open             - モーダル開閉。
 * @param {object} props.lot               - ロット情報。
 * @param {string} props.lotStatus         - ロット判定。
 * @param {object} props.shotsByCamera     - カメラ別ショット辞書。
 * @param {string} props.shotsStatus       - データ取得状態。
 * @param {object} props.lotSummary        - サマリー数値。
 * @param {Function} props.onClose         - 閉じる関数。
 * @param {Function} props.setLightbox     - ライトボックス制御。
 * @returns {JSX.Element|null}              モーダル要素。
 */
const SpringLotDetailModal = ({ open, lot, lotStatus, shotsByCamera, shotsStatus, lotSummary, onClose, setLightbox }) => {
  const normalizedLotStatus = (lotStatus || '').toString().trim().toUpperCase()
  const [showTable, setShowTable] = useState(false)
  /**
   * 代表画像のURL組を作り、フォールバックを保持する。
   * @param {string} path - 画像パス。
   * @returns {{primary: string, fallback: string}} 表示URL。
   */
  const buildImageSources = useCallback((path) => {
    const normalized = normalizeRelativePath(path)
    if (!normalized) return { primary: FALLBACK_IMG, fallback: '' }
    const primary = toImageUrl(normalized)
    const fallback = fallbackImageBase ? toImageUrl(normalized, { base: fallbackImageBase }) : ''
    return {
      primary: primary || FALLBACK_IMG,
      fallback: fallback && fallback !== primary ? fallback : '',
    }
  }, [])

  /**
   * ショットの状態に応じてbefore/afterのどちらを参照するかを決定する。
   * @param {object} shot - ショット情報。
   * @returns {{primary: string, fallback: string}} 表示URL。
   */
  const buildShotSources = useCallback((shot) => {
    if (!shot) return { primary: FALLBACK_IMG, fallback: '' }
    const normalized = normalizeRelativePath(shot.image_path)
    if (!normalized) return { primary: FALLBACK_IMG, fallback: '' }
    const status = (shot.status || '').toString().toUpperCase()
    const hasFallbackBase = Boolean(fallbackImageBase)

    const buildPair = builder => {
      const primaryCandidate = builder(normalized)
      const fallbackCandidate = hasFallbackBase ? builder(normalized, { base: fallbackImageBase }) : ''
      return { primary: primaryCandidate, fallback: fallbackCandidate }
    }

    const ensureUrl = pair => {
      if (pair.primary) return pair
      return buildPair((path, options) => toImageUrl(path, options))
    }

    let pair
    if (status === 'MISSING') {
      pair = ensureUrl(buildPair((path, options) => toBeforeTestUrl(path, options)))
    } else if (status === 'PASS' || status === 'FAIL') {
      pair = ensureUrl(buildPair((path, options) => toAfterTestUrl(path, options)))
    } else {
      pair = ensureUrl(buildPair((path, options) => toImageUrl(path, options)))
    }

    const primary = pair.primary || FALLBACK_IMG
    const fallback = pair.fallback && pair.fallback !== primary ? pair.fallback : ''

    return { primary, fallback }
  }, [])

  /**
   * 画像の読み込み失敗時、フォールバック→固定画像の順に差し替える。
   * @param {React.SyntheticEvent<HTMLImageElement>} event - onErrorイベント。
   * @param {string} fallbackSrc                          - フォールバックURL。
   */
  const handleImageError = (event, fallbackSrc) => {
    const target = event.currentTarget
    if (fallbackSrc && !target.dataset.fallbackTried) {
      target.dataset.fallbackTried = 'true'
      target.src = fallbackSrc
    } else if (target.src !== FALLBACK_IMG) {
      target.src = FALLBACK_IMG
    }
  }

  const representativeSources = useMemo(
    () => buildImageSources(lot?.representativeImage),
    [buildImageSources, lot?.representativeImage],
  )

  const shotEntries = useMemo(
    () => Object.entries(shotsByCamera || {}).map(([key, shots]) => [key, Array.isArray(shots) ? shots : []]),
    [shotsByCamera],
  )

  const flattenedShots = useMemo(() => {
    return Object.values(shotsByCamera || {}).reduce((acc, value) => {
      if (Array.isArray(value)) acc.push(...value)
      return acc
    }, [])
  }, [shotsByCamera])

  const normalizedLotSummary = useMemo(
    () => normalizeShotSummary(lotSummary, flattenedShots),
    [lotSummary, flattenedShots],
  )

  const hasShotEntries = shotEntries.length > 0

  useEffect(() => {
    if (!open) {
      setShowTable(false)
    }
  }, [open])

  if (!lot) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {lot.date} {lot.time}
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {lot.lotId}
            </Typography>
          </Box>
          <Chip label={normalizedLotStatus || '-'} color={getLotStatusColor(normalizedLotStatus)} size="small" variant="filled" />
        </Box>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          p: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'stretch',
            gap: { xs: 4, md: 6 },
            p: { xs: 4, md: 6 },
            boxSizing: 'border-box',
            height: { md: '70vh' },
          }}
        >
          <Box
            sx={{
              flexBasis: { md: '40%' },
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              position: { md: 'sticky' },
              top: { md: 24 },
            }}
          >
            <Box
              sx={{
                width: '100%',
                aspectRatio: '16/9',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: theme => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.200'),
                cursor: 'zoom-in',
              }}
              onClick={() => {
                if (setLightbox) {
                  setLightbox({
                    open: true,
                    src: representativeSources.primary,
                    fallback: representativeSources.fallback,
                    alt: lot.representativeImage ? `${lot.lotId} representative` : 'placeholder',
                  })
                }
              }}
            >
              <img
                src={representativeSources.primary}
                alt={lot.representativeImage ? `${lot.lotId} representative` : 'placeholder'}
                onError={e => handleImageError(e, representativeSources.fallback)}
                draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
            {normalizedLotSummary && (
              <ShotsSummaryBlock title="検査サマリー" summary={normalizedLotSummary} />
            )}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                判定要素
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(lot.cameras || []).map((camera, index) => {
                  const normalizedStatus = (camera.status || '').toString().trim().toUpperCase()
                  const canonicalStatus = normalizedStatus === 'OK'
                    ? 'PASS'
                    : normalizedStatus === 'NG'
                      ? 'FAIL'
                      : normalizedStatus || 'UNKNOWN'
                  const isPass = canonicalStatus === 'PASS'

                  return (
                    <Chip
                      key={`${camera.name}-${index}`}
                      label={`${camera.name}: ${canonicalStatus}`}
                      size="small"
                      color={getChipColor(canonicalStatus)}
                      variant={isPass ? 'outlined' : 'filled'}
                    />
                  )
                })}
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              minHeight: 0,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                  撮影・検査履歴
                </Typography>
                {showTable ? (
                  <Button size="small" variant="outlined" onClick={() => setShowTable(false)}>
                    画像に戻る
                  </Button>
                ) : null}
              </Box>
              <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: { xs: 'visible', md: 'auto' } }}>
                {showTable ? (
                  hasShotEntries ? (
                    <Table size="small" aria-label="lot shots table" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>カメラ/シーケンス</TableCell>
                          <TableCell>結果</TableCell>
                          <TableCell>詳細</TableCell>
                          <TableCell align="right">画像</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {shotEntries.flatMap(([key, shots]) =>
                          shots.map((shot, idx) => {
                            const sources = buildShotSources(shot)
                            const statusColor = getShotStatusColor(shot.status)

                            return (
                              <TableRow key={`${key}-${idx}`}>
                                <TableCell sx={{ fontWeight: 500 }}>{key}</TableCell>
                                <TableCell>
                                  <Chip label={shot.status || '-'} size="small" color={statusColor} />
                                </TableCell>
                                <TableCell>{shot.details || '-'}</TableCell>
                                <TableCell align="right" sx={{ width: 240 }}>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ maxWidth: '100%', wordBreak: 'break-all', textAlign: 'right' }}
                                    >
                                      {shot.image_path || '-'}
                                    </Typography>
                                    <Box
                                      sx={{
                                        width: 140,
                                        aspectRatio: '16/9',
                                        borderRadius: 1,
                                        overflow: 'hidden',
                                        bgcolor: theme => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.200'),
                                        cursor: 'zoom-in',
                                      }}
                                      onClick={() => {
                                        if (setLightbox) {
                                          setLightbox({ open: true, src: sources.primary, fallback: sources.fallback, alt: shot.image_path || 'shot' })
                                        }
                                      }}
                                    >
                                      <img
                                        src={sources.primary}
                                        alt={shot.image_path || 'shot'}
                                        onError={e => handleImageError(e, sources.fallback)}
                                        draggable={false}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      />
                                    </Box>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Typography variant="body2" color="text.secondary">
                        詳細データを取得中です…
                      </Typography>
                    </Box>
                  )
                ) : (
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      cursor: hasShotEntries ? 'pointer' : 'default',
                    }}
                    onClick={() => {
                      if (hasShotEntries) {
                        setShowTable(true)
                      }
                    }}
                  >
                    <Box
                      component="img"
                      src={DUMMY_SCREENSHOT_SRC}
                      alt="spring inspection layout"
                      sx={{
                        width: '100%',
                        maxWidth: 880,
                        borderRadius: 2,
                        boxShadow: theme => theme.shadows[4],
                        border: theme => `1px solid ${theme.palette.divider}`,
                        userSelect: 'none',
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      画像をクリックすると詳細が表示されます
                    </Typography>
                    {!hasShotEntries && (
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        詳細データを取得中です…
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SpringLotDetailModal
