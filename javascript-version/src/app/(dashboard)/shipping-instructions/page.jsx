'use client'

import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add'

// UI 分割コンポーネント
import FilterBar from './components/FilterBar'
import ShippingInstructionCard from './components/ShippingInstructionCard'
import InstructionModal from './components/InstructionModal'
import ConfirmRevertDialog from './components/ConfirmRevertDialog'

// データ: サンプル初期値とセレクトオプションを外部から読み込み
import { initialInstructions, lineOptions, completedOptions } from './data/sampleInitialInstructions'

// APIの新しい仕様に合わせてデータを正規化するヘルパー
function normalizeInstruction(apiItem) {
  // 元のフィールドと新仕様のフィールドのどちらにも対応する
  const id = apiItem.id
  const line = apiItem.line || apiItem.line_name || 'その他'

  // title は product_name と size を結合して作る。両方なければ既存の title を使う
  const productName = apiItem.product_name || apiItem.title || ''
  const size = apiItem.size || apiItem.spec || ''
  const title = [productName, size].filter(Boolean).join(' ').trim() || productName || apiItem.title || ''

  // 新仕様の個別フィールドも保持（カードで表示するため）
  const productNameField = productName
  const sizeField = size
  const springType = apiItem.spring_type || apiItem.springType || null
  const includedItems = apiItem.included_items || apiItem.includedItems || null

  // completed フラグの統一
  const completed = typeof apiItem.is_completed === 'boolean' ? apiItem.is_completed : (apiItem.completed === true)

  // フィールド名マッピング
  const color = apiItem.color || ''
  const shippingMethod = apiItem.shipping_method || apiItem.shippingMethod || apiItem.shippingMethodName || ''
  const destination = apiItem.destination || ''
  const remarks = apiItem.remarks || ''
  const note = apiItem.included_items || apiItem.note || ''
  const quantity = typeof apiItem.quantity === 'number' ? apiItem.quantity : (apiItem.qty ? Number(apiItem.qty) : (apiItem.quantity || 0))
  const createdAt = apiItem.created_at || apiItem.createdAt || null

  return { id, line, title, completed, color, shippingMethod, destination, remarks, note, quantity, createdAt, productName: productNameField, size: sizeField, springType, includedItems }
}

// ページ内関数: normalize はここに定義して各コンポーネントからは props で利用

const ShippingInstructions = () => {
  // 初期データを正規化して内部で使う形にする
  const [instructions, setInstructions] = useState(() => initialInstructions.map(normalizeInstruction))
  // データソース切替（ローカル or API）
  const [dataSource, setDataSource] = useState('api') // 'local' | 'api'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastFetchedAt, setLastFetchedAt] = useState(null)
  const [reloadTick, setReloadTick] = useState(0)
  const [search, setSearch] = useState('')
  const [line, setLine] = useState('すべて')
  const [completed, setCompleted] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ id: '', productName: '', size: '', title: '', line: 'マット', completed: false, remarks: '', color: '', shippingMethod: '', destination: '', includedItems: '', springType: '', quantity: 1 })
  const [editMode, setEditMode] = useState(false)

  // APIモード: /api/instructions から取得
  useEffect(() => {
    if (dataSource !== 'api') {
      // ローカルモードに戻ったら初期データへリセット
      setError(null)
      setLoading(false)
      setInstructions(initialInstructions.map(normalizeInstruction))
      return
    }

    const controller = new AbortController()
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        // 認証トークン（AuthGuard と同じキー）
        const token = typeof window !== 'undefined'
          ? (localStorage.getItem('access_token') || sessionStorage.getItem('access_token'))
          : null

        const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
        const res = await fetch(`${base}/api/instructions`, {
          method: 'GET',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          signal: controller.signal
        })

        if (!res.ok) {
          let detail = ''
          try {
            const t = await res.text()
            detail = t?.slice(0, 200)
          } catch { }
          throw new Error(`APIエラー (${res.status}) ${detail}`)
        }

        const json = await res.json()
        const list = Array.isArray(json) ? json : (json?.data || json?.items || [])
        if (!Array.isArray(list)) throw new Error('APIのレスポンス形式が不正です')

        setInstructions(list.map(normalizeInstruction))
        setLastFetchedAt(new Date().toISOString())
      } catch (e) {
        if (e?.name === 'AbortError') return
        setError(e?.message || 'データ取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    run()
    return () => controller.abort()
  }, [dataSource, reloadTick])

  // フィルタリング
  const filtered = instructions.filter(inst => {
    // 検索テキストのマッチング
    const searchText = search.toLowerCase()

    const textMatch = !searchText ||
      inst.title.toLowerCase().includes(searchText) ||
      (inst.destination && inst.destination.toLowerCase().includes(searchText)) ||
      (inst.remarks && inst.remarks.toLowerCase().includes(searchText)) ||
      (inst.note && inst.note.toLowerCase().includes(searchText))

    // ラインのマッチング
    const lineMatch = line === 'すべて' || inst.line === line

    // 完了状態のマッチング
    let completedMatch = true

    if (completed === 'completed') completedMatch = inst.completed
    else if (completed === 'not-completed') completedMatch = !inst.completed

    return textMatch && lineMatch && completedMatch
  })

  // 完了トグル（未完了->完了 は即時：紙吹雪、完了->未完了 は確認ダイアログ）
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingToggleId, setPendingToggleId] = useState(null)

  const handleToggleComplete = (id, clientX, clientY) => {
    const target = instructions.find(i => i.id === id)
    if (!target) return

    if (!target.completed) {
      // 未完了 -> 完了: 即時変更 + 紙吹雪
      setInstructions(prev => prev.map(inst => inst.id === id ? { ...inst, completed: true } : inst))
      // クリック座標が渡されたらその位置を起点に発射する
      let originX = 0.5
      let originY = 0.2
      if (typeof clientX === 'number' && typeof clientY === 'number') {
        originX = Math.min(Math.max(clientX / window.innerWidth, 0), 1)
        originY = Math.min(Math.max(clientY / window.innerHeight, 0), 1)
      }
      try {
        confetti({ particleCount: 150, spread: 80, origin: { x: originX, y: originY } })
      } catch (err) {
        // confetti が読み込めなくても動作は阻害しない
        console.warn('confetti failed', err)
      }
    } else {
      // 完了 -> 未完了: 確認ダイアログを開く
      setPendingToggleId(id)
      setConfirmOpen(true)
    }
  }

  const confirmRevert = () => {
    if (pendingToggleId == null) return
    setInstructions(prev => prev.map(inst => inst.id === pendingToggleId ? { ...inst, completed: false } : inst))
    setPendingToggleId(null)
    setConfirmOpen(false)
  }

  const cancelRevert = () => {
    setPendingToggleId(null)
    setConfirmOpen(false)
  }

  // 編集
  const handleEdit = inst => {
    setForm(inst)
    setEditMode(true)
    setModalOpen(true)
  }

  // 追加
  const handleAdd = () => {
    setForm({ id: '', productName: '', size: '', title: '', line: 'マット', completed: false, remarks: '', color: '', shippingMethod: '', destination: '', includedItems: '', springType: '', quantity: 1 })
    setEditMode(false)
    setModalOpen(true)
  }

  // 保存
  const handleSave = () => {
    // 必須: productName (もしくは title の互換)
    if (!form.productName && !form.title) return

    // 作成時は title を productName + size で組み立てる
    const computedTitle = form.productName ? ([form.productName, form.size].filter(Boolean).join(' ').trim()) : form.title

    const toSave = {
      ...form,
      title: computedTitle,
      productName: form.productName,
      size: form.size,
      springType: form.springType || null,
      includedItems: form.includedItems || form.note || null,
      shippingMethod: form.shippingMethod || null,
      quantity: typeof form.quantity === 'number' ? form.quantity : Number(form.quantity || 0),
      createdAt: form.createdAt || new Date().toISOString()
    }

    if (editMode) {
      setInstructions(prev => prev.map(inst => inst.id === form.id ? { ...inst, ...toSave } : inst))
    } else {
      const newId = Math.max(...instructions.map(i => i.id), 0) + 1
      setInstructions(prev => [...prev, { ...toSave, id: newId }])
    }

    setModalOpen(false)
  }

  // 入力変更
  const handleFormChange = e => {
    const { name, value } = e.target

    // 数値入力は number に変換
    if (name === 'quantity') {
      setForm(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }))
      return
    }

    setForm(prev => ({ ...prev, [name]: value }))
  }

  return (
    <>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        line={line}
        onLineChange={setLine}
        completed={completed}
        onCompletedChange={setCompleted}
        lineOptions={lineOptions}
        completedOptions={completedOptions}
      />
      <Grid container spacing={3} alignItems='stretch'>
        {filtered.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant='h6' color='text.secondary' sx={{ mb: 1 }}>該当する指示が見つかりませんでした。</Typography>
              <Typography variant='body2' color='text.disabled'>検索条件を変更して、もう一度お試しください。</Typography>
            </Card>
          </Grid>
        ) : (
          filtered.map(inst => (
            <Grid item xs={12} sm={6} md={4} xl={3} key={inst.id} sx={{ display: 'flex' }}>
              <ShippingInstructionCard instruction={inst} onToggleComplete={handleToggleComplete} onEdit={handleEdit} />
            </Grid>
          ))
        )}
      </Grid>

      {/* フローティング追加ボタン */}
      <Fab color='primary' aria-label='add' sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }} onClick={handleAdd}>
        <AddIcon fontSize='large' />
      </Fab>

      <InstructionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editMode={editMode}
        form={form}
        onFormChange={handleFormChange}
        lineOptions={lineOptions}
      />

      <ConfirmRevertDialog open={confirmOpen} onCancel={cancelRevert} onConfirm={confirmRevert} />
    </>
  )
}

export default ShippingInstructions

