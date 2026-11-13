import { ChevronRight, CircleAlert, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/shared/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useElementViewSize } from '@hooks/utils/size/useElementViewSize'
import { Banner, BannerButton } from '@ui/Banner/Banner'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './accountReconnectionBanner.scss'

const MS_PER_DAY = 24 * 60 * 60 * 1000

export type AccountReconnectionBannerProps = {
  accountLabel: string
  lastSyncedAt?: Date | null
  needsRepair?: boolean
  onClick?: () => void
}

export const AccountReconnectionBanner = ({ accountLabel, lastSyncedAt, needsRepair = false, onClick }: AccountReconnectionBannerProps) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const { view, containerRef } = useElementViewSize<HTMLDivElement>()
  const isMobile = view === 'mobile'

  const label = needsRepair
    ? t('linkedAccounts:AccountReconnectionBanner.label.account_disconnected', '{{accountLabel}} is disconnected', { accountLabel })
    : t('linkedAccounts:AccountReconnectionBanner.label.account_ready_for_refresh', '{{accountLabel}} is ready for refresh', { accountLabel })

  const daysSinceLastSynced = lastSyncedAt
    ? Math.max(1, Math.floor((Date.now() - lastSyncedAt.getTime()) / MS_PER_DAY))
    : null

  const description = needsRepair
    ? t('linkedAccounts:AccountReconnectionBanner.label.reconnect_description', 'Reconnect to resume importing transactions.')
    : daysSinceLastSynced === null
      ? t('linkedAccounts:AccountReconnectionBanner.label.never_refreshed', 'Never refreshed')
      : tPlural(t, 'linkedAccounts:AccountReconnectionBanner.label.last_refreshed_days_ago', {
        count: daysSinceLastSynced,
        displayCount: formatNumber(daysSinceLastSynced),
        one: 'Last refreshed {{displayCount}} day ago',
        other: 'Last refreshed {{displayCount}} days ago',
      })

  const actionLabel = needsRepair
    ? t('linkedAccounts:AccountReconnectionBanner.action.reconnect', 'Reconnect')
    : t('linkedAccounts:AccountReconnectionBanner.action.refresh_account_now', 'Refresh now')

  return (
    <HStack ref={containerRef} className='Layer__AccountReconnectionBanner' data-needs-repair={needsRepair || undefined} fluid>
      <Banner
        variant={needsRepair ? 'error' : 'success'}
        title=''
        slots={{
          Icon: isMobile ? null : needsRepair ? <CircleAlert size={16} /> : <RefreshCcw size={16} />,
          Button: isMobile || needsRepair
            ? (
              <BannerButton variant='outlined' onPress={onClick}>
                {actionLabel}
              </BannerButton>
            )
            : (
              <BannerButton variant='outlined' icon onPress={onClick} aria-label={label}>
                <ChevronRight size={18} />
              </BannerButton>
            ),
        }}
      >
        <VStack gap={needsRepair ? '4xs' : '3xs'} align='start'>
          <Span size={needsRepair ? 'sm' : undefined}>{label}</Span>
          <Span size={needsRepair ? 'xs' : 'sm'} variant='subtle' weight='normal'>{description}</Span>
        </VStack>
      </Banner>
    </HStack>
  )
}
