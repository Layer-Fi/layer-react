import { ChevronRight, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type BankAccountLabelParts } from '@utils/features/bankAccounts/bankAccount'
import { tPlural } from '@utils/shared/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useElementViewSize } from '@hooks/utils/size/useElementViewSize'
import { Banner, BannerButton } from '@ui/Banner/Banner'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './accountReconnectionBanner.scss'

const MS_PER_DAY = 24 * 60 * 60 * 1000

export type AccountReconnectionBannerProps = {
  account: BankAccountLabelParts
  lastSyncedAt: Date | null
  onClick?: () => void
}

export const AccountReconnectionBanner = ({ account, lastSyncedAt, onClick }: AccountReconnectionBannerProps) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const { view, containerRef } = useElementViewSize<HTMLDivElement>()
  const isMobile = view === 'mobile'

  const accountLabel = account.mask
    ? t('views:AccountReconnectionBanner.label.account_with_mask', '{{accountName}} ({{mask}})', {
      accountName: account.accountName,
      mask: account.mask,
    })
    : account.accountName

  const label = t(
    'views:AccountReconnectionBanner.label.account_ready_for_refresh',
    '{{accountLabel}} is ready for refresh',
    { accountLabel },
  )

  const daysSinceLastSynced = lastSyncedAt
    ? Math.max(1, Math.floor((Date.now() - lastSyncedAt.getTime()) / MS_PER_DAY))
    : null

  const lastRefreshedLabel = daysSinceLastSynced === null
    ? t('views:AccountReconnectionBanner.label.never_refreshed', 'Never refreshed')
    : tPlural(t, 'views:AccountReconnectionBanner.label.last_refreshed_days_ago', {
      count: daysSinceLastSynced,
      displayCount: formatNumber(daysSinceLastSynced),
      one: 'Last refreshed {{displayCount}} day ago',
      other: 'Last refreshed {{displayCount}} days ago',
    })

  const refreshNowLabel = t('views:AccountReconnectionBanner.action.refresh_now', 'Refresh Now')

  const ariaLabel = t(
    'views:AccountReconnectionBanner.label.account_status',
    '{{label}}. {{lastRefreshedLabel}}',
    { label, lastRefreshedLabel },
  )

  return (
    <HStack ref={containerRef} className='Layer__AccountingOverview__AccountReconnectionBanner' fluid>
      <Banner
        variant='success'
        title=''
        ariaLabel={ariaLabel}
        slots={{
          Icon: isMobile ? null : <RefreshCcw size={16} />,
          Button: isMobile
            ? (
              <BannerButton variant='outlined' onPress={onClick}>
                {refreshNowLabel}
              </BannerButton>
            )
            : (
              <BannerButton
                variant='outlined'
                icon
                onPress={onClick}
                aria-label={label}
              >
                <ChevronRight size={18} />
              </BannerButton>
            ),
        }}
      >
        <VStack gap='3xs' align='start'>
          <Span>{label}</Span>
          <Span size='sm' variant='subtle' weight='normal'>
            {lastRefreshedLabel}
          </Span>
        </VStack>
      </Banner>
    </HStack>
  )
}
