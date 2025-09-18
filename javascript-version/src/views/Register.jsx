'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import Avatar from '@mui/material/Avatar'
import Grid from '@mui/material/Grid'

// Component Imports
import Illustrations from '@components/Illustrations'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

const Register = ({ mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [employeeUserId, setEmployeeUserId] = useState('')
  const [lastName, setLastName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [password, setPassword] = useState('')
  const [roleName, setRoleName] = useState('一般')
  const [lineName, setLineName] = useState('')
  const [specialNotes, setSpecialNotes] = useState('')
  const [colorCode, setColorCode] = useState('FF8800')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Vars
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  // Hooks
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const router = useRouter()
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const isValid = () => {
    if (!employeeUserId || !lastName || !firstName || !password) return false
    return true
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!isValid()) return
    setError('')
    setLoading(true)
    try {
      const apiBase = process.env.NEXT_PUBLIC_BASE_PATH || ''
      const res = await fetch(`${apiBase}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_user_id: employeeUserId,
          password,
          employee_name: `${String(lastName || '').trim()}${(lastName && firstName) ? ' ' : ''}${String(firstName || '').trim()}`.trim(),
          employee_role_name: roleName,
          employee_line_name: lineName || undefined,
          employee_special_notes: specialNotes || undefined,
          employee_color_code: colorCode || undefined
        })
      })

      if (res.status === 201 || res.ok) {
        router.push('/login?registered=1')
      } else if (res.status === 400 || res.status === 409) {
        try {
          const err = await res.json()
          setError(err?.error || `登録に失敗しました (HTTP ${res.status})`)
        } catch {
          setError(`登録に失敗しました (HTTP ${res.status})`)
        }
      } else {
        setError(`登録に失敗しました (HTTP ${res.status})`)
      }
    } catch (err) {
      setError('サーバーに接続できませんでした。ネットワークをご確認ください。')
    } finally {
      setLoading(false)
    }
  }

  // カラーパレット（従業員編集ウィンドウに合わせた系統色 + 既定色 FF8800 を含む）
  const basePalette = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e']
  const paletteColors = Array.from(new Set([...basePalette, '#FF8800']))

  const getAvatarText = (ln, fn) => {
    // 姓を優先、空なら名、それも空なら『氏名』
    const base = String(ln || fn || '氏名').trim()
    if (!base) return '氏名'
    return base.slice(0, 3)
  }

  const getAvatarFontSize = text => {
    const len = String(text || '').length
    // 文字数に応じてフォントサイズを調整（80px円内）
    if (len <= 1) return 36
    if (len === 2) return 30
    return 24
  }

  const getDisplayName = (ln, fn) => {
    const l = String(ln || '').trim()
    const f = String(fn || '').trim()
    if (!l && !f) return '氏名'
    return f ? `${l} ${f}` : l
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[900px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-start mbe-6'>
            <Logo />
          </Link>
          <Typography variant='h4' align='center'>ここから冒険が始まります 🚀</Typography>
          <div className='flex flex-col gap-5'>
            <Typography className='mbs-1' align='center'>アプリ管理をもっと簡単で楽しく！</Typography>

            <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
              {error ? <Alert severity='error'>{error}</Alert> : null}

              <Grid container spacing={3}>
                {/* 左カラム: プレビュー + カラー選択 */}
                <Grid item xs={12} md={4}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar
                      sx={{ width: 80, height: 80, bgcolor: `#${colorCode}`, fontWeight: 700, mb: 1, color: '#fff', fontSize: getAvatarFontSize(getAvatarText(lastName, firstName)) }}
                    >
                      {getAvatarText(lastName, firstName)}
                    </Avatar>
                    <Typography variant='subtitle1' sx={{ fontWeight: 700 }} align='center'>{getDisplayName(lastName, firstName)}</Typography>
                    <Typography variant='body2' color='text.secondary' align='center'>{employeeUserId || 'ID'}</Typography>
                    <div style={{ marginTop: 16, width: '100%' }}>
                      <Typography variant='body2' sx={{ mb: 1 }} align='center'>色を選択</Typography>
                      <Grid container spacing={1}>
                        {paletteColors.map(color => {
                          const hex = color.replace('#', '').toUpperCase()
                          const isActive = (`#${colorCode}`).toUpperCase() === color.toUpperCase()
                          return (
                            <Grid item xs={2} key={color}>
                              <div
                                onClick={() => !loading && setColorCode(hex)}
                                style={{
                                  background: color,
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  cursor: loading ? 'not-allowed' : 'pointer',
                                  border: isActive ? '2px solid #6366f1' : '2px solid #fff',
                                  boxShadow: '0 0 0 1px rgba(0,0,0,0.08)'
                                }}
                                title={color}
                                aria-label={`色 ${color}`}
                              />
                            </Grid>
                          )
                        })}
                      </Grid>
                    </div>
                  </div>
                </Grid>

                {/* 右カラム: 入力群 */}
                <Grid item xs={12} md={8}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        autoFocus
                        fullWidth
                        label='ユーザーID'
                        placeholder='hana.kato'
                        value={employeeUserId}
                        onChange={e => setEmployeeUserId(e.target.value)}
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label='姓'
                        placeholder='加藤'
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label='名'
                        placeholder='花'
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label='パスワード'
                        type={isPasswordShown ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={loading}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                size='small'
                                edge='end'
                                onClick={handleClickShowPassword}
                                onMouseDown={e => e.preventDefault()}
                                disabled={loading}
                              >
                                <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label='役割'
                        value={roleName}
                        onChange={e => setRoleName(e.target.value)}
                        disabled={loading}
                      >
                        <MenuItem value='一般'>一般</MenuItem>
                        <MenuItem value='管理者'>管理者</MenuItem>
                        <MenuItem value='検査員'>検査員</MenuItem>
                        <MenuItem value='デバッガー'>デバッガー</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label='担当ライン名'
                        placeholder='第一ライン'
                        value={lineName}
                        onChange={e => setLineName(e.target.value)}
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label='特記事項'
                        placeholder='夜勤中心 など'
                        value={specialNotes}
                        onChange={e => setSpecialNotes(e.target.value)}
                        disabled={loading}
                        multiline
                        minRows={2}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <div className='flex flex-col items-center gap-2'>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant='contained'
                    type='submit'
                    disabled={loading || !isValid()}
                    sx={{ maxWidth: 400, minWidth: 280, alignSelf: 'center' }}
                  >
                    {loading ? '作成中…' : 'アカウント作成'}
                  </Button>
                </Grid>

                <div className='flex flex-row items-center justify-center gap-1'>
                  <Typography align='center'>すでにアカウントをお持ちですか？</Typography>
                  <Typography component={Link} href='/login' color='primary' align='center'>
                    こちらからサインイン
                  </Typography>
                </div>
              </div>
              <Divider className='gap-3'>または(未実装)</Divider>
              <div className='flex justify-center items-center gap-2'>
                <IconButton size='small' className='text-facebook'>
                  <i className='ri-facebook-fill' />
                </IconButton>
                <IconButton size='small' className='text-twitter'>
                  <i className='ri-twitter-fill' />
                </IconButton>
                <IconButton size='small' className='text-github'>
                  <i className='ri-github-fill' />
                </IconButton>
                <IconButton size='small' className='text-googlePlus'>
                  <i className='ri-google-fill' />
                </IconButton>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  )
}

export default Register
