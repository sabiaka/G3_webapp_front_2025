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
            const init = {}
            inspectionItems.forEach((it) => { init[it.id] = false })
            setCheckedMap(init)
        }
    }, [open, inspectionItems])

    const allChecked = inspectionItems.length > 0 && inspectionItems.every((it) => checkedMap[it.id])
    const toggleCheck = (id) => setCheckedMap((prev) => ({ ...prev, [id]: !prev[id] }))
    const checkAll = () => {
        const m = {}
        inspectionItems.forEach((it) => { m[it.id] = true })
        setCheckedMap(m)
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
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>キャンセル</Button>
                <Button variant='contained' onClick={() => onComplete()} disabled={!allChecked}>点検完了</Button>
            </DialogActions>
        </Dialog>
    )
}

export function IntervalDialog({ open, onClose, value, onChange, nextInspectionDate }) {
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
                <Button variant='contained' onClick={onClose}>保存</Button>
            </DialogActions>
        </Dialog>
    )
}
