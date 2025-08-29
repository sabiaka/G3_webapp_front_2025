// MUI インポート
import Chip from '@mui/material/Chip'
import { useTheme } from '@mui/material/styles'

// サードパーティ インポート
import PerfectScrollbar from 'react-perfect-scrollbar'

// コンポーネント インポート
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'

// フック インポート
import useVerticalNav from '@menu/hooks/useVerticalNav'

// スタイル付きコンポーネント インポート
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// スタイル インポート
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }) => {
  // フック
  const theme = useTheme()
  const { isBreakpointReached, transitionDuration } = useVerticalNav()
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* ブラウザのスクロールの代わりにカスタムスクロールバーを使用、ブラウザスクロールのみにしたい場合は削除してください */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {/* NavHeaderもVertical Menuと一緒にスクロールさせたい場合は、上記からNavHeaderを削除してこのコメントの下に貼り付けてください */}
      {/* 垂直メニュー */}
      <Menu
        menuItemStyles={menuItemStyles(theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(theme)}
      >
        <SubMenu
          label='ダッシュボード'
          icon={<i className='ri-home-smile-line' />}
        >
          <MenuItem href='/'>アナリティクス</MenuItem>
        </SubMenu>
        <MenuSection label='アプリ & ページ'>
          <MenuItem href='/account-settings' icon={<i className='ri-user-settings-line' />}>
            アカウント設定
          </MenuItem>
          <SubMenu label='認証ページ' icon={<i className='ri-shield-keyhole-line' />}>
            <MenuItem href='/login' target='_blank'>
              ログイン
            </MenuItem>
            <MenuItem href='/register' target='_blank'>
              登録
            </MenuItem>
            <MenuItem href='/forgot-password' target='_blank'>
              パスワード再設定
            </MenuItem>
          </SubMenu>
          <SubMenu label='その他' icon={<i className='ri-question-line' />}>
            <MenuItem href='/error' target='_blank'>
              エラー
            </MenuItem>
            <MenuItem href='/under-maintenance' target='_blank'>
              メンテナンス中
            </MenuItem>
          </SubMenu>
          <MenuItem href='/card-basic' icon={<i className='ri-bar-chart-box-line' />}>
            カード
          </MenuItem>
        </MenuSection>
        <MenuSection label='フォーム & テーブル'>
          <MenuItem href='/form-layouts' icon={<i className='ri-layout-4-line' />}>
            フォームレイアウト
          </MenuItem>
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
