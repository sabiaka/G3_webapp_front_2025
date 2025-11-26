// 画像の完全URLを生成するヘルパ
// 目的: 実行中のホストのIP/ホスト名に対してポート3001で配信される画像にアクセスする
// 使い方:
//   toImageUrl('path/to/img.jpg') => 'http://<current-host>:3001/path/to/img.jpg'
//   toImageUrl('/storage/img.jpg') => 'http://<current-host>:3001/storage/img.jpg'
//   toImageUrl('http://example.com/a.jpg') => そのまま返却

const stripTrailingSlash = value => (value || '').replace(/\/$/, '')

const ensureProtocol = value => {
  if (!value) return ''
  return /^https?:\/\//i.test(value) ? value : `http://${value}`
}

const normalizeBase = value => {
  const trimmed = stripTrailingSlash((value || '').trim())
  if (!trimmed) return ''
  return stripTrailingSlash(ensureProtocol(trimmed))
}

// ベースURLを決定（環境変数で明示指定も可能）
export const getImageBase = () => {
  const override = normalizeBase(process.env.NEXT_PUBLIC_IMAGE_BASE)
  if (override) return override
  if (typeof window !== 'undefined') return `http://${window.location.hostname}:3001`
  // SSR等ウィンドウ未定義時のフォールバック
  return 'http://localhost:3001'
}

const FALLBACK_DEFAULT_BASE = 'http://10.100.54.170:3001'

export const getFallbackImageBase = () => normalizeBase(process.env.NEXT_PUBLIC_IMAGE_FALLBACK_BASE) || FALLBACK_DEFAULT_BASE

const buildUrlWithBase = (p, base) => {
  if (!p) return ''
  if (/^https?:\/\//i.test(p)) return p
  const resolvedBase = stripTrailingSlash(base || '')
  if (!resolvedBase) return p
  return p.startsWith('/') ? `${resolvedBase}${p}` : `${resolvedBase}/${p}`
}

// 与えられたパス/URLを画像の完全URLへ変換
export const toImageUrl = (p, options = {}) => buildUrlWithBase(p, options.base || getImageBase())

export default toImageUrl

// MISSING（画像未取得等）の場合に使用する beforeTest フォールバックURLを生成
// 入力がパス/URLであっても末尾のファイル名だけを採用して
//   http://{現在のホスト}:3001/imageDB/beforeTest/<filename>
// を返します。ファイル名が取れない場合は空文字を返します。
export const toBeforeTestUrl = (p, options = {}) => {
  const fname = (p || '').split('/').pop() || ''
  if (!fname) return ''
  const base = stripTrailingSlash(options.base || getImageBase())
  if (!base) return ''
  return `${base}/imageDB/beforeTest/${fname}`
}

// PASS/FAIL など検査完了時に使用する afterTest 側のURLを生成
// 入力の末尾ファイル名を利用し、
//   http://{現在のホスト}:3001/imageDB/afterTest/<filename>
// を返します。ファイル名が取れない場合は空文字を返します。
export const toAfterTestUrl = (p, options = {}) => {
  const fname = (p || '').split('/').pop() || ''
  if (!fname) return ''
  const base = stripTrailingSlash(options.base || getImageBase())
  if (!base) return ''
  return `${base}/imageDB/afterTest/${fname}`
}
