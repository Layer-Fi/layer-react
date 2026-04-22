import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type CallBooking as CallBookingData } from '@schemas/callBooking'
import { type Variants } from '@utils/styleUtils/sizeVariants'
import { useBookkeepingStatus } from '@hooks/api/businesses/[business-id]/bookkeeping/status/useBookkeepingStatus'
import { useCallBookings } from '@hooks/api/businesses/[business-id]/call-bookings/useCallBookings'
import { useSizeClass, useWindowSize } from '@hooks/utils/size/useWindowSize'
import { VStack } from '@ui/Stack/Stack'
import { CallBooking } from '@components/CallBooking/CallBooking'
import { Container } from '@components/Container/Container'
import { EmbeddedOnboarding } from '@components/EmbeddedOnboarding/EmbeddedOnboarding'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { ProfitAndLoss } from '@components/ProfitAndLoss/ProfitAndLoss'
import { type ProfitAndLossDetailedChartsStringOverrides } from '@components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { ProfitAndLossOverviewDetailedCharts } from '@components/ProfitAndLossOverviewDetailedCharts/ProfitAndLossOverviewDetailedCharts'
import { type ProfitAndLossSummariesStringOverrides } from '@components/ProfitAndLossSummaries/ProfitAndLossSummaries'
import { Tasks, type TasksStringOverrides } from '@components/Tasks/Tasks'
import { View } from '@components/View/View'
import { useKeepInMobileViewport } from '@views/BookkeepingOverview/useKeepInMobileViewport'

export interface BookkeepingOverviewProps {
  showTitle?: boolean
  stringOverrides?: {
    title?: string
    tasks?: TasksStringOverrides
    profitAndLoss?: {
      header?: string
      detailedCharts?: ProfitAndLossDetailedChartsStringOverrides
      summaries?: ProfitAndLossSummariesStringOverrides
    }
  }
  slotProps?: {
    profitAndLoss?: {
      summaries?: {
        variants?: Variants
      }
    }
  }

  onClickReconnectAccounts?: () => void
  /**
   * @deprecated Use `stringOverrides.title` instead
   */
  title?: string
}

export const BookkeepingOverview = ({
  title,
  showTitle = true,
  onClickReconnectAccounts,
  stringOverrides,
  slotProps,
}: BookkeepingOverviewProps) => {
  const { t } = useTranslation()
  const [width] = useWindowSize()
  const { value: sizeClass } = useSizeClass()

  const profitAndLossSummariesVariants =
    slotProps?.profitAndLoss?.summaries?.variants

  const { upperContentRef, targetElementRef, upperElementInFocus } =
    useKeepInMobileViewport()

  const { data: bookkeepingStatus } = useBookkeepingStatus()

  const [embedDismissed, setEmbedDismissed] = useState(false)

  const onboardingCallUrlFromApi =
    bookkeepingStatus != null
    && bookkeepingStatus.showEmbeddedOnboarding
    && bookkeepingStatus.onboardingCallUrl != null
      ? bookkeepingStatus.onboardingCallUrl
      : undefined

  const embeddedOnboardingCallUrl =
    embedDismissed ? undefined : onboardingCallUrlFromApi

  const { data: callBookings, isError, isLoading, isValidating } = useCallBookings({ limit: 1 })
  const callBooking: CallBookingData | null = callBookings?.[0]?.data[0] ?? null
  const callBookingVisible = callBooking && !isLoading && !isValidating && !isError

  return (
    <ProfitAndLoss asContainer={false}>
      <View
        viewClassName='Layer__bookkeeping-overview--view'
        title={stringOverrides?.title || title || t('overview:label.bookkeeping_overview', 'Bookkeeping overview')}
        header={(
          <Header>
            <HeaderRow>
              <HeaderCol>
                <GlobalMonthPicker truncateMonth={sizeClass === 'mobile'} />
              </HeaderCol>
            </HeaderRow>
          </Header>
        )}
        withSidebar={width > 1100}
        sidebar={(
          <VStack gap='lg'>
            {callBookingVisible && callBooking && (
              <CallBooking callBooking={callBooking} />
            )}
            <Tasks
              stringOverrides={stringOverrides?.tasks}
              onClickReconnectAccounts={onClickReconnectAccounts}
            />
          </VStack>
        )}
        showHeader={showTitle}
      >
        {width <= 1100 && (
          <div
            ref={upperContentRef}
            onClick={() => (upperElementInFocus.current = true)}
          >
            <VStack gap='lg'>
              {callBookingVisible && callBooking && (
                <CallBooking callBooking={callBooking} />
              )}
              <Tasks
                mobile
                stringOverrides={stringOverrides?.tasks}
                onClickReconnectAccounts={onClickReconnectAccounts}
              />
            </VStack>
          </div>
        )}
        <div
          ref={targetElementRef}
          onClick={() => (upperElementInFocus.current = false)}
        >
          <Container
            name='bookkeeping-overview-profit-and-loss'
            asWidget
            style={{
              position: 'relative',
              zIndex: 2,
            }}
          >
            <ProfitAndLoss.Header
              text={stringOverrides?.profitAndLoss?.header || t('common:label.profit_loss', 'Profit & Loss')}
              withStatus
            />
            <VStack pb='md' pi='md' fluid>
              <ProfitAndLoss.Summaries
                stringOverrides={stringOverrides?.profitAndLoss?.summaries}
                variants={profitAndLossSummariesVariants}
              />
            </VStack>
            <ProfitAndLoss.Chart />
          </Container>
        </div>
        <ProfitAndLossOverviewDetailedCharts
          variant='bookkeeping'
          detailedChartsStringOverrides={stringOverrides?.profitAndLoss?.detailedCharts}
        />
      </View>
      {embeddedOnboardingCallUrl != null && (
        <EmbeddedOnboarding
          onboardingCallUrl={embeddedOnboardingCallUrl}
          onComplete={() => {
            setEmbedDismissed(true)
          }}
        />
      )}
    </ProfitAndLoss>
  )
}
