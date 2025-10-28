'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'

// Vars
const initialData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  organization: 'ThemeSelection',
  phoneNumber: '+1 (917) 543-9876',
  address: '123 Main St, New York, NY 10001',
  state: 'New York',
  zipCode: '634880',
  country: 'usa',
  language: 'arabic',
  timezone: 'gmt-12',
  currency: 'usd'
}

const languageData = ['英語', 'アラビア語', 'フランス語', 'ドイツ語', 'ポルトガル語']

const AccountDetails = () => {
  // States
  const [formData, setFormData] = useState(initialData)
  const [fileInput, setFileInput] = useState('')
  const [imgSrc, setImgSrc] = useState('/images/avatars/1.png')
  const [language, setLanguage] = useState(['英語'])

  const handleDelete = value => {
    setLanguage(current => current.filter(item => item !== value))
  }

  const handleChange = event => {
    setLanguage(event.target.value)
  }

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleFileInputChange = file => {
    const reader = new FileReader()
    const { files } = file.target

    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result)
      reader.readAsDataURL(files[0])

      if (reader.result !== null) {
        setFileInput(reader.result)
      }
    }
  }

  const handleFileInputReset = () => {
    setFileInput('')
    setImgSrc('/images/avatars/1.png')
  }

  return (
    <Card>
      <CardContent className='mbe-5'>
        <div className='flex max-sm:flex-col items-center gap-6'>
          <img height={100} width={100} className='rounded' src={imgSrc} alt='プロフィール' />
          <div className='flex flex-grow flex-col gap-4'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <Button component='label' size='small' variant='contained' htmlFor='account-settings-upload-image'>
                新しい写真をアップロード
                <input
                  hidden
                  type='file'
                  value={fileInput}
                  accept='image/png, image/jpeg'
                  onChange={handleFileInputChange}
                  id='account-settings-upload-image'
                />
              </Button>
              <Button size='small' variant='outlined' color='error' onClick={handleFileInputReset}>
                リセット
              </Button>
            </div>
            <Typography>JPG・GIF・PNG が使用可能です。最大サイズは 800KB です。</Typography>
          </div>
        </div>
      </CardContent>
      <CardContent>
        <form onSubmit={e => e.preventDefault()}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='名'
                value={formData.firstName}
                placeholder='John'
                onChange={e => handleFormChange('firstName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='姓'
                value={formData.lastName}
                placeholder='Doe'
                onChange={e => handleFormChange('lastName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='メールアドレス'
                value={formData.email}
                placeholder='john.doe@gmail.com'
                onChange={e => handleFormChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='所属/組織'
                value={formData.organization}
                placeholder='ThemeSelection'
                onChange={e => handleFormChange('organization', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='電話番号'
                value={formData.phoneNumber}
                placeholder='+1 (234) 567-8901'
                onChange={e => handleFormChange('phoneNumber', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='住所'
                value={formData.address}
                placeholder='住所'
                onChange={e => handleFormChange('address', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='州/都道府県'
                value={formData.state}
                placeholder='ニューヨーク'
                onChange={e => handleFormChange('state', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='number'
                label='郵便番号'
                value={formData.zipCode}
                placeholder='123456'
                onChange={e => handleFormChange('zipCode', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>国</InputLabel>
                <Select
                  label='国'
                  value={formData.country}
                  onChange={e => handleFormChange('country', e.target.value)}
                >
                  <MenuItem value='usa'>アメリカ合衆国</MenuItem>
                  <MenuItem value='uk'>イギリス</MenuItem>
                  <MenuItem value='australia'>オーストラリア</MenuItem>
                  <MenuItem value='germany'>ドイツ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>言語</InputLabel>
                <Select
                  multiple
                  label='言語'
                  value={language}
                  onChange={handleChange}
                  renderValue={selected => (
                    <div className='flex flex-wrap gap-2'>
                      {selected.map(value => (
                        <Chip
                          key={value}
                          clickable
                          deleteIcon={
                            <i className='ri-close-circle-fill' onMouseDown={event => event.stopPropagation()} />
                          }
                          size='small'
                          label={value}
                          onDelete={() => handleDelete(value)}
                        />
                      ))}
                    </div>
                  )}
                >
                  {languageData.map(name => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>タイムゾーン</InputLabel>
                <Select
                  label='タイムゾーン'
                  value={formData.timezone}
                  onChange={e => handleFormChange('timezone', e.target.value)}
                  MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
                >
                  <MenuItem value='gmt-12'>(GMT-12:00) 国際日付変更線 西側</MenuItem>
                  <MenuItem value='gmt-11'>(GMT-11:00) ミッドウェー島、サモア</MenuItem>
                  <MenuItem value='gmt-10'>(GMT-10:00) ハワイ</MenuItem>
                  <MenuItem value='gmt-09'>(GMT-09:00) アラスカ</MenuItem>
                  <MenuItem value='gmt-08'>(GMT-08:00) 太平洋標準時（米国およびカナダ）</MenuItem>
                  <MenuItem value='gmt-08-baja'>(GMT-08:00) ティフアナ、バハ・カリフォルニア</MenuItem>
                  <MenuItem value='gmt-07'>(GMT-07:00) チワワ、ラパス、マサトラン</MenuItem>
                  <MenuItem value='gmt-07-mt'>(GMT-07:00) 山岳部標準時（米国およびカナダ）</MenuItem>
                  <MenuItem value='gmt-06'>(GMT-06:00) 中米</MenuItem>
                  <MenuItem value='gmt-06-ct'>(GMT-06:00) 中部標準時（米国およびカナダ）</MenuItem>
                  <MenuItem value='gmt-06-mc'>(GMT-06:00) グアダラハラ、メキシコシティ、モンテレイ</MenuItem>
                  <MenuItem value='gmt-06-sk'>(GMT-06:00) サスカチュワン</MenuItem>
                  <MenuItem value='gmt-05'>(GMT-05:00) ボゴタ、リマ、キト、リオブランコ</MenuItem>
                  <MenuItem value='gmt-05-et'>(GMT-05:00) 東部標準時（米国およびカナダ）</MenuItem>
                  <MenuItem value='gmt-05-ind'>(GMT-05:00) インディアナ（東部）</MenuItem>
                  <MenuItem value='gmt-04'>(GMT-04:00) 大西洋標準時（カナダ）</MenuItem>
                  <MenuItem value='gmt-04-clp'>(GMT-04:00) カラカス、ラパス</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>通貨</InputLabel>
                <Select
                  label='通貨'
                  value={formData.currency}
                  onChange={e => handleFormChange('currency', e.target.value)}
                >
                  <MenuItem value='usd'>米ドル</MenuItem>
                  <MenuItem value='euro'>ユーロ</MenuItem>
                  <MenuItem value='pound'>英ポンド</MenuItem>
                  <MenuItem value='bitcoin'>ビットコイン</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} className='flex gap-4 flex-wrap'>
              <Button variant='contained' type='submit'>
                変更を保存
              </Button>
              <Button variant='outlined' type='reset' color='secondary' onClick={() => setFormData(initialData)}>
                リセット
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default AccountDetails
