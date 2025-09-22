"use client";

import { useEffect, useMemo, useState, useCallback } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

// Bridge for legacy DOM-string modals to Materio (MUI) Dialog
// Usage from window (legacy):
//   window.__pi_openModal({ title, html, actions: [{id,label,color}], onOpen, maxWidth })
//   window.__pi_closeModal()
export default function ModalBridge() {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [html, setHtml] = useState('')
    const [actions, setActions] = useState([])
    const [maxWidth, setMaxWidth] = useState('sm')
    const [onOpen, setOnOpen] = useState(null)

    const handleClose = useCallback(() => {
        setOpen(false)
        // also clear content for safety
        setTitle('')
        setHtml('')
        setActions([])
        setOnOpen(null)
    }, [])

    useEffect(() => {
        // expose globals
        window.__pi_openModal = ({ title = '', html = '', actions = [], maxWidth = 'sm', onOpen = null } = {}) => {
            setTitle(title)
            setHtml(html)
            setActions(actions)
            setMaxWidth(maxWidth)
            setOnOpen(() => onOpen)
            setOpen(true)
        }
        window.__pi_closeModal = handleClose
        // signal readiness
        window.__pi_modal_ready = true
        try { window.dispatchEvent(new CustomEvent('pi:modal-ready')) } catch { }
        return () => {
            if (window.__pi_openModal === undefined) return
            delete window.__pi_modal_ready
            delete window.__pi_openModal
            delete window.__pi_closeModal
        }
    }, [handleClose])

    // call onOpen after content injected and dialog open
    useEffect(() => {
        if (open && typeof onOpen === 'function') {
            // next tick to ensure content in DOM
            const id = requestAnimationFrame(() => onOpen())
            return () => cancelAnimationFrame(id)
        }
    }, [open, onOpen])

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth={maxWidth} scroll='paper'>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px' }}>
                <DialogTitle sx={{ p: 0 }}>{title}</DialogTitle>
                <IconButton aria-label='close' onClick={handleClose} size='small'>
                    <CloseIcon />
                </IconButton>
            </div>
            <DialogContent dividers>
                {/* eslint-disable-next-line react/no-danger */}
                <div dangerouslySetInnerHTML={{ __html: html }} />
            </DialogContent>
            {actions?.length ? (
                <DialogActions>
                    {actions.map(a => (
                        <Button key={a.id || a.label} color={a.color || 'primary'} variant={a.variant || 'contained'} onClick={() => a.onClick?.()}>
                            {a.label}
                        </Button>
                    ))}
                </DialogActions>
            ) : null}
        </Dialog>
    )
}
