'use client'

// View Imports
import AccountSettings from '@views/account-settings'
import Account from '@views/account-settings/account'
import Notifications from '@views/account-settings/notifications'
import Connections from '@views/account-settings/connections'

export default function AccountSettingsPage() {
  const tabContentList = {
    account: <Account />,
    notifications: <Notifications />,
    connections: <Connections />
  }

  return <AccountSettings tabContentList={tabContentList} />
}
