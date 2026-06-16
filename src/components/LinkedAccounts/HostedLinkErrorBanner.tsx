import { type ReactNode, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'
import { Banner } from '@ui/Banner/Banner'

type HostedLinkErrorBannerProps = {
  slots?: { Button?: ReactNode }
}

export function HostedLinkErrorBanner({ slots }: HostedLinkErrorBannerProps = {}) {
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
      slots={slots}
    />
  )
}
