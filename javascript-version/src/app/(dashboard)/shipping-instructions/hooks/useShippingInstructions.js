// 状態管理・API通信・フィルタリング・イベントハンドラをカスタムフック

import { useEffect, useMemo, useState } from 'react'
import confetti from 'canvas-confetti'

import { normalizeInstruction, formatLocalYmd, toOffsetIso } from '../utils'
import { initialInstructions, lineOptions, completedOptions } from '../data/sampleInitialInstructions'

export default function useShippingInstructions() {
    const [instructions, setInstructions] = useState(() => initialInstructions.map(normalizeInstruction))
    const [dataSource, setDataSource] = useState('api') // 'local' | 'api'
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [lastFetchedAt, setLastFetchedAt] = useState(null)
    const [reloadTick, setReloadTick] = useState(0)
    const [search, setSearch] = useState('')
    const [line, setLine] = useState('すべて')
    const [completed, setCompleted] = useState('all')
    const [date, setDate] = useState(() => formatLocalYmd())
    const [modalOpen, setModalOpen] = useState(false)
    const [form, setForm] = useState({ id: '', productName: '', size: '', title: '', line: 'マット', completed: false, remarks: '', color: '', shippingMethod: '', destination: '', includedItems: '', springType: '', quantity: 1 })
    const [editMode, setEditMode] = useState(false)
    const [saving, setSaving] = useState(false)

    const [lines, setLines] = useState([])
    const [loadingLines, setLoadingLines] = useState(false)

    const [availableDates, setAvailableDates] = useState([])
    const [loadingDates, setLoadingDates] = useState(false)

    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [targetToDelete, setTargetToDelete] = useState(null)

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [pendingToggleId, setPendingToggleId] = useState(null)

    // Fetch instructions
    useEffect(() => {
        if (dataSource !== 'api') {
            setError(null)
            setLoading(false)
            setInstructions(initialInstructions.map(normalizeInstruction))
            setLines([])
            return
        }

        const controller = new AbortController()
        const run = async () => {
            try {
                setLoading(true)
                setError(null)

                const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
                const params = new URLSearchParams()
                if (search && search.trim()) params.set('q', search.trim())
                if (line && line !== 'すべて') params.set('line', line)
                if (completed === 'completed') params.set('is_completed', 'true')
                else if (completed === 'not-completed') params.set('is_completed', 'false')
                if (date) params.set('date', date)

                const url = `${base}/api/instructions${params.toString() ? `?${params.toString()}` : ''}`
                const res = await fetch(url, {
                    method: 'GET',
                    signal: controller.signal
                })

                if (!res.ok) {
                    let detail = ''
                    try { detail = (await res.text())?.slice(0, 200) } catch { }
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
    }, [dataSource, reloadTick, search, line, completed, date])

    // Fetch lines for modal select
    useEffect(() => {
        if (dataSource !== 'api') return
        const controller = new AbortController()
        const run = async () => {
            try {
                setLoadingLines(true)
                const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
                const res = await fetch(`${base}/api/lines`, { method: 'GET', signal: controller.signal })
                if (!res.ok) { setLines([]); return }
                const json = await res.json()
                const list = Array.isArray(json) ? json : (json?.data || json?.items || [])
                setLines(Array.isArray(list) ? list : [])
            } catch (e) {
                if (e?.name === 'AbortError') return
                setLines([])
            } finally {
                setLoadingLines(false)
            }
        }
        run()
        return () => controller.abort()
    }, [dataSource])

    // Fetch available dates
    useEffect(() => {
        if (dataSource !== 'api') return
        const controller = new AbortController()
        const run = async () => {
            try {
                setLoadingDates(true)
                const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
                const params = new URLSearchParams()
                if (line && line !== 'すべて') params.set('line', line)
                if (completed === 'completed') params.set('is_completed', 'true')
                else if (completed === 'not-completed') params.set('is_completed', 'false')
                params.set('order', 'asc')

                const url = `${base}/api/instructions/available-dates${params.toString() ? `?${params.toString()}` : ''}`
                const res = await fetch(url, { method: 'GET', signal: controller.signal })
                if (!res.ok) { setAvailableDates([]); return }
                const json = await res.json()
                const list = Array.isArray(json) ? json : (json?.data || json?.items || [])
                // 仕様変更対応: [{ date: 'YYYY-MM-DD', count: number }] を想定
                // 互換性のため、文字列配列の場合も考慮しつつ、日付文字列配列に正規化
                const items = Array.isArray(list) ? list : []
                const normalized = items.map(item => {
                    if (typeof item === 'string') return { date: item, count: null }
                    if (item && typeof item === 'object') return { date: String(item.date || ''), count: typeof item.count === 'number' ? item.count : null }
                    return { date: '', count: null }
                }).filter(i => i.date)
                const asc = normalized.sort((a, b) => String(a.date).localeCompare(String(b.date)))
                setAvailableDates(asc.map(i => i.date))
            } catch (e) {
                if (e?.name === 'AbortError') return
                setAvailableDates([])
            } finally {
                setLoadingDates(false)
            }
        }
        run()
        return () => controller.abort()
    }, [dataSource, line, completed, reloadTick])

    const currentIndex = availableDates.findIndex(d => d === date)
    const canPrev = currentIndex > 0
    const canNext = currentIndex !== -1 && currentIndex < availableDates.length - 1
    const handlePrevDate = () => { if (canPrev) setDate(availableDates[currentIndex - 1]) }
    const handleNextDate = () => { if (canNext) setDate(availableDates[currentIndex + 1]) }

    const filtered = useMemo(() => {
        if (dataSource === 'api') return instructions
        return instructions.filter(inst => {
            const searchText = search.toLowerCase()
            const textMatch = !searchText ||
                inst.title.toLowerCase().includes(searchText) ||
                (inst.destination && inst.destination.toLowerCase().includes(searchText)) ||
                (inst.remarks && inst.remarks.toLowerCase().includes(searchText)) ||
                (inst.note && inst.note.toLowerCase().includes(searchText))
            const lineMatch = line === 'すべて' || inst.line === line
            let completedMatch = true
            if (completed === 'completed') completedMatch = inst.completed
            else if (completed === 'not-completed') completedMatch = !inst.completed
            const dateMatch = !date || (inst.createdAt && inst.createdAt.startsWith(date))
            return textMatch && lineMatch && completedMatch && dateMatch
        })
    }, [dataSource, instructions, search, line, completed, date])

    const updateCompletionOnServer = async (id, comp) => {
        if (dataSource !== 'api' || !id) return
        try {
            setError(null)
            const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
            const res = await fetch(`${base}/api/instructions/${encodeURIComponent(id)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_completed: comp })
            })
            if (!res.ok) {
                let detail = ''
                try { detail = (await res.text())?.slice(0, 200) } catch { }
                throw new Error(`更新に失敗しました (${res.status}) ${detail}`)
            }
            let updated = null
            try { updated = await res.json() } catch { }
            if (updated) {
                setInstructions(prev => prev.map(inst => inst.id === id ? normalizeInstruction(updated) : inst))
            }
        } catch (e) {
            setError(e?.message || '完了状態の更新に失敗しました')
            setInstructions(prev => prev.map(inst => inst.id === id ? { ...inst, completed: !comp } : inst))
        }
    }

    const handleToggleComplete = (id, clientX, clientY) => {
        const target = instructions.find(i => i.id === id)
        if (!target) return
        if (!target.completed) {
            setInstructions(prev => prev.map(inst => inst.id === id ? { ...inst, completed: true } : inst))
            let originX = 0.5
            let originY = 0.2
            if (typeof clientX === 'number' && typeof clientY === 'number') {
                originX = Math.min(Math.max(clientX / window.innerWidth, 0), 1)
                originY = Math.min(Math.max(clientY / window.innerHeight, 0), 1)
            }
            try { confetti({ particleCount: 150, spread: 80, origin: { x: originX, y: originY } }) } catch { }
            updateCompletionOnServer(id, true)
        } else {
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
    const cancelRevert = () => { setPendingToggleId(null); setConfirmOpen(false) }

    const handleEdit = inst => { setForm(inst); setEditMode(true); setModalOpen(true) }
    const handleRequestDelete = inst => { setTargetToDelete(inst); setDeleteOpen(true) }
    const handleCancelDelete = () => { setTargetToDelete(null); setDeleteOpen(false) }

    const handleConfirmDelete = async () => {
        if (!targetToDelete) return
        const id = targetToDelete.id
        if (!id && dataSource === 'api') { setTargetToDelete(null); setDeleteOpen(false); return }
        if (dataSource === 'api') {
            try {
                setDeleting(true)
                setError(null)
                const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
                const res = await fetch(`${base}/api/instructions/${encodeURIComponent(id)}`, { method: 'DELETE' })
                if (!res.ok) {
                    let detail = ''
                    try { detail = (await res.text())?.slice(0, 200) } catch { }
                    throw new Error(`削除に失敗しました (${res.status}) ${detail}`)
                }
                setInstructions(prev => prev.filter(i => i.id !== id))
            } catch (e) {
                setError(e?.message || '削除に失敗しました')
            } finally {
                setDeleting(false)
                setTargetToDelete(null)
                setDeleteOpen(false)
            }
        } else {
            setInstructions(prev => prev.filter(i => i.id !== id))
            setTargetToDelete(null)
            setDeleteOpen(false)
        }
    }

    const handleAdd = () => {
        const defaultLine = (dataSource === 'api' && lines?.length > 0)
            ? (lines[0]?.line_name || '')
            : 'マット'
        setForm({ id: '', productName: '', size: '', title: '', line: defaultLine, completed: false, remarks: '', color: '', shippingMethod: '', destination: '', includedItems: '', springType: '', quantity: 1 })
        setEditMode(false)
        setModalOpen(true)
    }

    const handleSave = async () => {
        if (!form.productName && !form.title) return
        const computedTitle = form.productName ? ([form.productName, form.size].filter(Boolean).join(' ').trim()) : form.title
        const createdAtIso = toOffsetIso(form.createdAt) || toOffsetIso(new Date())

        const toSave = {
            ...form,
            title: computedTitle,
            productName: form.productName,
            size: form.size,
            springType: form.springType || null,
            includedItems: form.includedItems || form.note || null,
            shippingMethod: form.shippingMethod || null,
            quantity: typeof form.quantity === 'number' ? form.quantity : Number(form.quantity || 0),
            createdAt: createdAtIso
        }

        if (editMode) {
            if (dataSource === 'api') {
                try {
                    setSaving(true)
                    setError(null)
                    const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
                    const payload = {
                        line: form.line || 'その他',
                        product_name: form.productName || form.title || '',
                        size: form.size || '',
                        quantity: typeof form.quantity === 'number' ? form.quantity : Number(form.quantity || 0),
                        remarks: form.remarks || ''
                    }
                    if (form.color) payload.color = form.color
                    if (form.springType) payload.spring_type = form.springType
                    if (form.includedItems || form.note) payload.included_items = form.includedItems || form.note
                    if (form.shippingMethod) payload.shipping_method = form.shippingMethod
                    if (form.destination) payload.destination = form.destination
                    if (createdAtIso) payload.created_at = createdAtIso

                    const res = await fetch(`${base}/api/instructions/${encodeURIComponent(form.id)}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    })
                    if (!res.ok) {
                        let detail = ''
                        try { detail = (await res.text())?.slice(0, 200) } catch { }
                        throw new Error(`更新に失敗しました (${res.status}) ${detail}`)
                    }
                    let updated
                    try { updated = await res.json() } catch { updated = null }
                    const normalized = updated ? normalizeInstruction(updated) : { ...toSave }
                    setInstructions(prev => prev.map(inst => inst.id === form.id ? { ...inst, ...normalized } : inst))
                    setModalOpen(false)
                    const ymd = (normalized.createdAt || createdAtIso || '').slice(0, 10)
                    if (ymd) setDate(ymd)
                    setReloadTick(t => t + 1)
                } catch (e) {
                    setError(e?.message || '更新に失敗しました')
                } finally {
                    setSaving(false)
                }
            } else {
                setInstructions(prev => prev.map(inst => inst.id === form.id ? { ...inst, ...toSave } : inst))
                setModalOpen(false)
                const ymd = (toSave.createdAt || '').slice(0, 10)
                if (ymd) setDate(ymd)
            }
        } else {
            if (dataSource === 'api') {
                try {
                    setSaving(true)
                    setError(null)
                    const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
                    const payload = {
                        line: form.line || 'その他',
                        product_name: form.productName || form.title || '',
                        size: form.size || '',
                        quantity: typeof form.quantity === 'number' ? form.quantity : Number(form.quantity || 0),
                        remarks: form.remarks || ''
                    }
                    if (form.color) payload.color = form.color
                    if (form.springType) payload.spring_type = form.springType
                    if (form.includedItems || form.note) payload.included_items = form.includedItems || form.note
                    if (form.shippingMethod) payload.shipping_method = form.shippingMethod
                    if (form.destination) payload.destination = form.destination
                    if (createdAtIso) payload.created_at = createdAtIso

                    const res = await fetch(`${base}/api/instructions`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    })
                    if (!res.ok) {
                        let detail = ''
                        try { detail = (await res.text())?.slice(0, 200) } catch { }
                        throw new Error(`作成に失敗しました (${res.status}) ${detail}`)
                    }
                    const created = await res.json()
                    const normalized = normalizeInstruction(created)
                    setInstructions(prev => [...prev, normalized])
                    setModalOpen(false)
                    const ymd = (normalized.createdAt || createdAtIso || '').slice(0, 10)
                    if (ymd) setDate(ymd)
                    setReloadTick(t => t + 1)
                } catch (e) {
                    setError(e?.message || '作成に失敗しました')
                } finally {
                    setSaving(false)
                }
            } else {
                const newId = Math.max(...instructions.map(i => i.id), 0) + 1
                const added = { ...toSave, id: newId }
                setInstructions(prev => [...prev, added])
                setModalOpen(false)
                const ymd = (added.createdAt || '').slice(0, 10)
                if (ymd) setDate(ymd)
            }
        }
    }

    const handleFormChange = e => {
        const { name, value } = e.target
        if (name === 'quantity') {
            setForm(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }))
            return
        }
        setForm(prev => ({ ...prev, [name]: value }))
    }

    return {
        state: {
            instructions, dataSource, loading, error, lastFetchedAt, reloadTick, search, line, completed, date,
            modalOpen, form, editMode, saving, lines, loadingLines, availableDates, loadingDates, deleteOpen, deleting, targetToDelete,
            confirmOpen, pendingToggleId
        },
        derived: {
            filtered, canPrev, canNext
        },
        actions: {
            setDataSource, setSearch, setLine, setCompleted, setDate, setModalOpen, setForm, setEditMode,
            setDeleteOpen, setTargetToDelete,
            handlePrevDate, handleNextDate,
            handleToggleComplete, confirmRevert, cancelRevert,
            handleEdit, handleRequestDelete, handleCancelDelete, handleConfirmDelete,
            handleAdd, handleSave, handleFormChange
        }
    }
}