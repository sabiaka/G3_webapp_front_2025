// オリジナルアイコン(スプリング)のコンポーネント

import SvgIcon from '@mui/material/SvgIcon'

// 縦向きのギザギザ線アイコン（コイル/バネ風）
const SpringIcon = props => (
  <SvgIcon {...props} viewBox='0 0 24 24'>
    <path
      d='M7 4 L11 8 L7 12 L11 16 L7 20'
      stroke='currentColor'
      strokeWidth='2'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M17 4 L13 8 L17 12 L13 16 L17 20'
      stroke='currentColor'
      strokeWidth='2'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </SvgIcon>
)

export default SpringIcon
