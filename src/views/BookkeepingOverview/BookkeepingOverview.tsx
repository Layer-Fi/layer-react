import classNames from 'classnames'
import { PopupModal } from 'react-calendly'
import { useTranslation } from 'react-i18next'

import { type TagOption } from '@internal-types/tags'
import { type CallBooking as CallBookingData } from '@schemas/callBooking'
import { useBookkeepingOnboardingCallBooking } from '@hooks/features/bookkeeping/useBookkeepingOnboardingCallBooking'
import { useSizeClass, useWindowSize } from '@hooks/utils/size/useWindowSize'
import { VStack } from '@ui/Stack/Stack'
import { CallBooking } from '@components/CallBooking/CallBooking'
import { Container } from '@components/Container/Container'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { ProfitAndLoss } from '@components/ProfitAndLoss/ProfitAndLoss'
import { type ProfitAndLossDetailedChartsStringOverrides } from '@components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { ProfitAndLossHeader } from '@components/ProfitAndLossHeader/ProfitAndLossHeader'
import { ProfitAndLossOverviewDetailedCharts } from '@components/ProfitAndLossOverviewDetailedCharts/ProfitAndLossOverviewDetailedCharts'
import {
  type FinancialSummariesSlotProps,
  type ProfitAndLossSummariesStringOverrides,
} from '@components/ProfitAndLossSummaries/ProfitAndLossSummaries'
import { PnlLegend } from '@components/ProfitAndLossSummaryCard/PnlLegend'
import { Tasks, type TasksStringOverrides } from '@components/Tasks/Tasks'
import { View } from '@components/View/View'
import { useKeepInMobileViewport } from '@views/BookkeepingOverview/useKeepInMobileViewport'

import './bookkeepingOverview.scss'

type BookkeepingOverviewTasksContentProps = {
  callBooking?: CallBookingData
  showCallBookingCard: boolean
  tasksMobile: boolean
  tasksStringOverrides?: TasksStringOverrides
  onBookCall: () => void
  onClickReconnectAccounts?: () => void
}

const BookkeepingOverviewTasksContent = ({
  callBooking,
  showCallBookingCard,
  tasksMobile,
  tasksStringOverrides,
  onBookCall,
  onClickReconnectAccounts,
}: BookkeepingOverviewTasksContentProps) => {
  return (
    <>
      {showCallBookingCard && (
        <CallBooking
          callBooking={callBooking}
          onBookCall={onBookCall}
        />
      )}
      <Tasks
        mobile={tasksMobile}
        stringOverrides={tasksStringOverrides}
        onClickReconnectAccounts={onClickReconnectAccounts}
      />
    </>
  )
}

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
    financialSummaries?: FinancialSummariesSlotProps
  }

  chartColorsList?: string[]
  onClickReconnectAccounts?: () => void
  tagFilter?: TagOption
  /**
   * @deprecated Use `stringOverrides.title` instead
   */
  title?: string
}

export const BookkeepingOverview = ({
  title,
  showTitle = true,
  onClickReconnectAccounts,
  chartColorsList,
  stringOverrides,
  slotProps,
  tagFilter = undefined,
}: BookkeepingOverviewProps) => {
  const { t } = useTranslation()
  const [width] = useWindowSize()
  const { value: sizeClass } = useSizeClass()

  const financialSummariesSlotProps = slotProps?.financialSummaries
  const profitAndLossTagFilter = tagFilter?.tagValues.length
    ? { key: tagFilter.tagKey, values: tagFilter.tagValues }
    : undefined

  const { upperContentRef, targetElementRef, upperElementInFocus } =
    useKeepInMobileViewport()

  const {
    callBooking,
    showCallBookingCard,
    handleBookCall,
    isCalendlyVisible,
    calendlyLink,
    calendlyRef,
    closeCalendly,
  } = useBookkeepingOnboardingCallBooking()

  return (
    <ProfitAndLoss
      asContainer={false}
      tagFilter={profitAndLossTagFilter}
    >
      <View
        viewClassName='Layer__bookkeeping-overview--view Layer__BookkeepingOverview'
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
            <BookkeepingOverviewTasksContent
              callBooking={callBooking}
              showCallBookingCard={showCallBookingCard}
              tasksMobile={false}
              tasksStringOverrides={stringOverrides?.tasks}
              onBookCall={handleBookCall}
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
              <BookkeepingOverviewTasksContent
                callBooking={callBooking}
                showCallBookingCard={showCallBookingCard}
                tasksMobile
                tasksStringOverrides={stringOverrides?.tasks}
                onBookCall={handleBookCall}
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
            className='Layer__BookkeepingOverview__ProfitAndLossContainer'
            asWidget
            style={{
              position: 'relative',
              zIndex: 2,
            }}
          >
            <ProfitAndLossHeader
              stringOverrides={{ title: stringOverrides?.profitAndLoss?.header }}
              withStatus
              trailingContent={<PnlLegend direction='row' />}
              className='Layer__BookkeepingOverview__ProfitAndLossHeader'
            />
            <VStack pb='md' pi='md' fluid>
              <ProfitAndLoss.Summaries
                stringOverrides={stringOverrides?.profitAndLoss?.summaries}
                chartColorsList={chartColorsList}
                reportingVariant={financialSummariesSlotProps?.reportingVariant}
                variants={financialSummariesSlotProps?.variants}
              />
            </VStack>
            <ProfitAndLoss.Chart
              hideLegend
              tagFilter={profitAndLossTagFilter}
            />
          </Container>
        </div>
        <ProfitAndLossOverviewDetailedCharts
          variant='bookkeeping'
          detailedChartsStringOverrides={stringOverrides?.profitAndLoss?.detailedCharts}
          chartColorsList={chartColorsList}
        />
      </View>
      {isCalendlyVisible && (
        <div
          ref={calendlyRef}
          className={classNames('Layer__calendly-container', { visible: isCalendlyVisible })}
        >
          <PopupModal
            url={calendlyLink}
            onModalClose={closeCalendly}
            open={isCalendlyVisible}
            rootElement={document.body}
          />
        </div>
      )}
    </ProfitAndLoss>
  )
}
