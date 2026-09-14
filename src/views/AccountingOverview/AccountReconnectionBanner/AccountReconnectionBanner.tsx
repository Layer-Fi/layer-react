import { ChevronRight, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Banner, BannerButton } from '@ui/Banner/Banner'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './accountReconnectionBanner.scss'

export type AccountReconnectionBannerProps = {
  onClick?: () => void
}

export const AccountReconnectionBanner = ({ onClick }: AccountReconnectionBannerProps) => {
  const { t } = useTranslation()
  const { isMobile } = useSizeClass()

  const label = t(
    'views:AccountingOverview.AccountReconnectionBanner.label.account_ready_for_refresh',
    'RBC Business Checking (4048) is ready for refresh',
  )
  const lastRefreshedLabel = t(
    'views:AccountingOverview.AccountReconnectionBanner.label.last_refreshed_two_weeks_ago',
    'Last refreshed two weeks ago',
  )

  return (
    <HStack className='Layer__AccountingOverview__AccountReconnectionBanner' fluid>
      <Banner
        variant='success'
        title=''
        ariaLabel={`${label}. ${lastRefreshedLabel}`}
        slots={{
          Icon: isMobile ? null : <RefreshCcw size={16} />,
          Button: (
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
