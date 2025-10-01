'use client'

import { useEffect, useMemo, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'

import { formatYmdSlash } from '../utils/date'

export function InspectionDialog({ open, onClose, onComplete }) {
    const STORAGE_KEY = 'machine-status:inspection-progress'
    const inspectionItems = useMemo(() => [
        { id: 'chk1', label: '安全カバーに異常なし' },
        { id: 'chk2', label: '非常停止ボタンの動作確認' },
        { id: 'chk3', label: '潤滑油レベル適正' },
        { id: 'chk4', label: 'センサー清掃済み' },
        { id: 'chk5', label: 'ボルト・ナットの緩みなし' },
    ], [])

    const [checkedMap, setCheckedMap] = useState({})
    useEffect(() => {
        if (open) {
            // 開いたときにローカルストレージから復元（なければ初期化）
            let stored = {}
            try {
                const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
                if (raw) stored = JSON.parse(raw) || {}
            } catch (e) {
                stored = {}
            }
            const init = {}
            inspectionItems.forEach((it) => { init[it.id] = Boolean(stored[it.id]) })
            setCheckedMap(init)
        }
    }, [open, inspectionItems])

    const allChecked = inspectionItems.length > 0 && inspectionItems.every((it) => checkedMap[it.id])
    const persist = (map) => {
        try {
            if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
        } catch (e) {
            // ignore write errors
        }
    }

    const toggleCheck = (id) => setCheckedMap((prev) => {
        const next = { ...prev, [id]: !prev[id] }
        persist(next)
        return next
    })
    const checkAll = () => {
        const m = {}
        inspectionItems.forEach((it) => { m[it.id] = true })
        setCheckedMap(m)
        persist(m)
    }

    const resetProgress = () => {
        const m = {}
        inspectionItems.forEach((it) => { m[it.id] = false })
        setCheckedMap(m)
        try {
            if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY)
        } catch (e) {
            // ignore
        }
    }

    const handleComplete = () => {
        // 進捗クリアは親で成功時に実施する（API連携時の失敗に備える）
        onComplete()
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
            <DialogTitle>点検</DialogTitle>
            <DialogContent dividers>
                <Typography variant='body2' color='text.secondary' mb={2}>
                    ダミーの点検項目です。すべてチェックしてから「点検完了」を押してください。
                </Typography>
                <FormGroup>
                    {inspectionItems.map((item) => (
                        <FormControlLabel
                            key={item.id}
                            control={<Checkbox checked={!!checkedMap[item.id]} onChange={() => toggleCheck(item.id)} />}
                            label={item.label}
                        />
                    ))}
                </FormGroup>
                <Box mt={1}>
                    <Button size='small' onClick={checkAll}>すべてチェック</Button>
                    <Button size='small' color='secondary' onClick={resetProgress} sx={{ ml: 1 }}>進捗をリセット</Button>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>キャンセル</Button>
                <Button variant='contained' onClick={handleComplete} disabled={!allChecked}>点検完了</Button>
            </DialogActions>
        </Dialog>
    )
}

export function IntervalDialog({ open, onClose, value, onChange, nextInspectionDate, onSave, saving = false }) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
            <DialogTitle>点検期間の変更</DialogTitle>
            <DialogContent dividers>
                <Typography variant='body2' color='text.secondary' mb={2}>
                    何日ごとに点検を行うかを設定できます（フロントのみ・ダミー）。
                </Typography>
                <TextField
                    type='number'
                    label='点検間隔（日）'
                    value={value}
                    onChange={(e) => {
                        const v = Math.max(1, Number(e.target.value || 1))
                        onChange(v)
                    }}
                    inputProps={{ min: 1 }}
                    fullWidth
                />
                <Box mt={2}>
                    <Typography variant='caption' color='text.secondary'>
                        次回点検日: {formatYmdSlash(nextInspectionDate)}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>キャンセル</Button>
                <Button variant='contained' onClick={() => (onSave ? onSave(value) : onClose())} disabled={saving}>
                    {saving ? '保存中…' : '保存'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
