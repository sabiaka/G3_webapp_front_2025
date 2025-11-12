// フルスクリーン用途のレイアウト (サイネージ等)
// URL には (signage) というグループ名は現れません。/machine-signage などは VerticalLayout を経由せずに表示されます。

import Providers from '@components/Providers'
import AuthGuard from '@components/AuthGuard'
// DarkModeForcer は Client Component に分離
import DarkModeForcer from './components/DarkModeForcer'

const Layout = ({ children }) => {
  const direction = 'ltr'
  return (
    <Providers direction={direction}>
      <AuthGuard>
        <DarkModeForcer />
        {/* 余白を排除し全面表示 */}
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>{children}</div>
      </AuthGuard>
    </Providers>
  )
}

export default Layout
