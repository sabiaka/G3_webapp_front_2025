"use client"

import { useEffect } from 'react'
import { useSettings } from '@core/hooks/useSettings'

// サイネージ専用: 初回マウント時に強制的に dark モードへ切替
const DarkModeForcer = () => {
  const { settings, updateSettings } = useSettings()
  useEffect(() => {
    if (settings.mode !== 'dark') updateSettings({ mode: 'dark' })
  }, [settings.mode, updateSettings])
  return null
}

export default DarkModeForcer
