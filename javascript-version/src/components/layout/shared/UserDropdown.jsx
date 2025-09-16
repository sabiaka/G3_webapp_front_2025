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
        <Avatar
          ref={anchorRef}
          alt={user?.employee_name || 'ゲスト'}
          src='/images/avatars/1.png'
          onClick={handleDropdownOpen}
          className='cursor-pointer bs-[38px] is-[38px]'
        />
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
                    <Avatar alt={user?.employee_name || 'ゲスト'} src='/images/avatars/1.png' />
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
