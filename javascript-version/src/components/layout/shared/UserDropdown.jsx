"use client"

// React Imports
import { useEffect, useRef, useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

// --- Avatar helpers ---------------------------------------------------------
// 抽出ルール:
// 1) スペース(半角/全角)や中点があれば先頭トークンを姓とみなす
// 2) それ以外は連続する漢字ブロック(最長3文字)を姓とみなす
// 3) 漢字がなければ先頭語の先頭1-2文字
const extractFamilyName = name => {
  if (!name || typeof name !== 'string') return 'ゲ'
  const n = name.trim()
  if (!n) return 'ゲ'

  // 分割候補: 半角/全角スペース, 中点
  const token = n.split(/[	\s\u3000・]+/)[0]
  if (token && token.length < n.length) return token

  // 連続する漢字ブロックを抽出 (CJK統合漢字+拡張A)
  const m = n.match(/^[\u4E00-\u9FFF\u3400-\u4DBF]{1,3}/)
  if (m) return m[0]

  // 漢字がない場合: 先頭語の先頭2文字(日本語/ローマ字を想定)
  const firstWord = n.split(/[\s\u3000]+/)[0]
  return firstWord.slice(0, 2)
}

// 名前から安定したカラー(HSL)を生成
const stringToHslColor = (str, s = 65, l = 48) => {
  let hash = 0
  for (let i = 0; i < (str || '').length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue} ${s}% ${l}%)`
}

// ユーザーにカラーコード属性があればそれを優先
const getUserColor = user => {
  const c =
    user?.employee_color_code ||
    user?.color_code ||
    user?.avatar_color ||
    user?.profile_color ||
    user?.bg_color ||
    user?.color
  if (typeof c === 'string' && c.trim()) {
    // 先頭に#がないhexも許容
    const v = c.trim()
    if (/^#?[0-9a-fA-F]{6}$/.test(v)) return v.startsWith('#') ? v : `#${v}`
    return v // hsl(...) / rgb(...), CSSカラー名など
  }
  // 名前から生成
  const name = user?.employee_name || user?.name || user?.username || 'guest'
  return stringToHslColor(name)
}

// 3文字以上のときはやや小さめのフォント
const getAvatarFontSize = text => (text && text.length >= 3 ? 14 : 16)

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Refs
  const anchorRef = useRef(null)

  // Hooks
  const router = useRouter()

  // Helpers
  const getStoredToken = () => {
    try {
      if (typeof window === 'undefined') return null
      return (
        window.localStorage.getItem('access_token') ||
        window.sessionStorage.getItem('access_token')
      )
    } catch {
      return null
    }
  }

  const clearStoredAuth = () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('access_token')
        window.localStorage.removeItem('user')
        window.sessionStorage.removeItem('access_token')
        window.sessionStorage.removeItem('user')
      }
    } catch {}
  }

  // Fetch current user on mount
  useEffect(() => {
    let isMounted = true
    const fetchMe = async () => {
      setLoading(true)
      const token = getStoredToken()
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const apiBase = process.env.NEXT_PUBLIC_BASE_PATH || ''
        const res = await fetch(`${apiBase}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        })

        if (res.ok) {
          const data = await res.json()
          if (isMounted) setUser(data)
        } else if (res.status === 401) {
          clearStoredAuth()
          // ここでは即リダイレクトはしない。メニューからログイン導線に誘導する想定
        }
      } catch (e) {
        // ネットワークエラーは黙って無視（UIはゲスト表示）
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchMe()
    return () => {
      isMounted = false
    }
  }, [])

  const handleDropdownOpen = () => {
    !open ? setOpen(true) : setOpen(false)
  }

  const handleDropdownClose = (event, url) => {
    if (url) {
      router.push(url)
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target)) {
      return
    }

    setOpen(false)
  }

  const handleLogout = async event => {
    event?.preventDefault?.()
    setOpen(false)

    try {
      const apiBase = process.env.NEXT_PUBLIC_BASE_PATH || ''
      await fetch(`${apiBase}/api/auth/logout`, { method: 'POST', credentials: 'include' })
    } catch (e) {
      // ignore network errors; proceed to clear client state
    }

    clearStoredAuth()

    router.replace('/login')
  }

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        {(() => {
          const text = extractFamilyName(user?.employee_name || user?.name || (loading ? '…' : 'ゲスト'))
          const bg = getUserColor(user)
          const fontSize = getAvatarFontSize(text)
          return (
            <Avatar
              ref={anchorRef}
              alt={user?.employee_name || 'ゲスト'}
              onClick={handleDropdownOpen}
              className='cursor-pointer bs-[38px] is-[38px]'
              sx={{ bgcolor: bg, color: 'white', fontSize, fontWeight: 600 }}
            >
              {text}
            </Avatar>
          )
        })()}
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-4 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className='shadow-lg'>
              <ClickAwayListener onClickAway={e => handleDropdownClose(e)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-4 gap-2' tabIndex={-1}>
                    {(() => {
                      const text = extractFamilyName(user?.employee_name || user?.name || (loading ? '…' : 'ゲスト'))
                      const bg = getUserColor(user)
                      const fontSize = getAvatarFontSize(text)
                      return (
                        <Avatar alt={user?.employee_name || 'ゲスト'} sx={{ bgcolor: bg, color: 'white', fontSize, fontWeight: 600 }}>
                          {text}
                        </Avatar>
                      )
                    })()}
                    <div className='flex items-start flex-col'>
                      <Typography className='font-medium' color='text.primary'>
                        {user?.employee_name || (loading ? '読み込み中…' : 'ゲスト')}
                      </Typography>
                      <Typography variant='caption'>
                        {user?.role_name || ''}
                      </Typography>
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e)}>
                    <i className='ri-user-3-line' />
                    <Typography color='text.primary'>マイプロフィール</Typography>
                  </MenuItem>
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e)}>
                    <i className='ri-settings-4-line' />
                    <Typography color='text.primary'>設定</Typography>
                  </MenuItem>
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e)}>
                    <i className='ri-money-dollar-circle-line' />
                    <Typography color='text.primary'>料金</Typography>
                  </MenuItem>
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e)}>
                    <i className='ri-question-line' />
                    <Typography color='text.primary'>FAQ</Typography>
                  </MenuItem>
                  <div className='flex items-center plb-2 pli-4'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='ri-logout-box-r-line' />}
                      onClick={handleLogout}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                    >
                      ログアウト
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown
