import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'
import { Banner } from '@ui/Banner/Banner'

export function HostedLinkErrorBanner() {
  const { t } = useTranslation()
  const { isHostedLinkError } = useContext(LinkedAccountsContext)

  if (!isHostedLinkError) return null

  return (
    <Banner
      variant='error'
      title={t('linkedAccounts:error.hosted_link_failed_title', 'Connection failed')}
      description={t(
        'linkedAccounts:error.hosted_link_failed_description',
        'We couldn’t finish linking your account. Please try again.',
      )}
    />
  )
}
