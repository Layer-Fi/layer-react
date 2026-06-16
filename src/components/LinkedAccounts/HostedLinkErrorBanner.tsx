import { useCallback, useContext, useMemo } from 'react'
import { RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'
import { Banner } from '@ui/Banner/Banner'
import { Button } from '@ui/Button/Button'

type HostedLinkErrorBannerProps = {
  showRetryButton?: boolean
}

export function HostedLinkErrorBanner({ showRetryButton = false }: HostedLinkErrorBannerProps = {}) {
  const { t } = useTranslation()
  const { isHostedLinkError, addConnection } = useContext(LinkedAccountsContext)

  const onRetry = useCallback(() => {
    void addConnection('PLAID')
  }, [addConnection])

  const RetryButton = useMemo(() => {
    if (!showRetryButton) return null
    return (
      <Button onPress={onRetry} variant='outlined'>
        {t('common:action.try_again', 'Try again')}
        <RefreshCcw size={12} />
      </Button>
    )
  }, [onRetry, showRetryButton, t])

  if (!isHostedLinkError) return null

  return (
    <Banner
      variant='error'
      title={t('linkedAccounts:error.hosted_link_failed_title', 'Connection failed')}
      description={t(
        'linkedAccounts:error.hosted_link_failed_description',
        'We couldn’t finish linking your account. Please try again.',
      )}
      slots={{ Button: RetryButton }}
    />
  )
}
