import { useTranslation } from 'react-i18next'

import {
  type CallBooking as CallBookingData,
  CallBookingPurpose,
  CallBookingState,
} from '@schemas/callBooking'
import { type Variants } from '@utils/styleUtils/sizeVariants'
import { useBookkeepingStatus } from '@hooks/api/businesses/[business-id]/bookkeeping/status/useBookkeepingStatus'
import { useCallBookings } from '@hooks/api/businesses/[business-id]/call-bookings/useCallBookings'
import { useEmbeddedOnboardingConfirmationHold } from '@hooks/features/bookkeeping/useEmbeddedOnboardingConfirmationHold'
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

  const { data: callBookings } = useCallBookings()
  const onboardingBooking: CallBookingData | undefined = callBookings
    ?.flatMap(({ data }) => data)
    .find(({ purpose }) => purpose === CallBookingPurpose.BOOKKEEPING_ONBOARDING)
  const upcomingOnboardingBooking = onboardingBooking?.state === CallBookingState.SCHEDULED
    ? onboardingBooking
    : undefined

  const {
    shouldShow: shouldShowEmbeddedOnboarding,
    onboardingCallUrl,
    onEventScheduled: onOnboardingEventScheduled,
  } = useEmbeddedOnboardingConfirmationHold({
    showEmbeddedOnboarding: bookkeepingStatus?.showEmbeddedOnboarding === true,
    onboardingCallUrl: bookkeepingStatus?.onboardingCallUrl ?? undefined,
  })

  if (shouldShowEmbeddedOnboarding && onboardingCallUrl) {
    return (
      <EmbeddedOnboarding
        onboardingCallUrl={onboardingCallUrl}
        onEventScheduled={onOnboardingEventScheduled}
      />
    )
  }

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
            {upcomingOnboardingBooking && (
              <CallBooking callBooking={upcomingOnboardingBooking} />
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
              {upcomingOnboardingBooking && (
                <CallBooking callBooking={upcomingOnboardingBooking} />
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
    </ProfitAndLoss>
  )
}
