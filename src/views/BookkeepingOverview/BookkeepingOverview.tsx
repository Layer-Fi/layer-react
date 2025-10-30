import { useState } from 'react'
import { PopupModal } from 'react-calendly'
import classNames from 'classnames'
import { Container } from '../../components/Container'
import { ProfitAndLoss } from '../../components/ProfitAndLoss/ProfitAndLoss'
import { ProfitAndLossDetailedChartsStringOverrides } from '../../components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { ProfitAndLossSummariesStringOverrides } from '../../components/ProfitAndLossSummaries/ProfitAndLossSummaries'
import { Tasks, TasksStringOverrides } from '../../components/Tasks/Tasks'
import { Toggle } from '../../components/Toggle'
import { View } from '../../components/View'
import { useWindowSize } from '../../hooks/useWindowSize'
import { Variants } from '../../utils/styleUtils/sizeVariants'
import { BookkeepingProfitAndLossSummariesContainer } from './internal/BookkeepingProfitAndLossSummariesContainer'
import { useKeepInMobileViewport } from './useKeepInMobileViewport'
import { VStack } from '../../components/ui/Stack/Stack'
import { CallBooking } from '../../components/CallBooking/CallBooking'
import { type CallBooking as CallBookingData } from '../../schemas/callBookings'
import { useCalendly } from '../../hooks/useCalendly/useCalendly'
import { useCallBookings } from '../../features/callBookings/api/useCallBookings'

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

type PnlToggleOption = 'revenue' | 'expenses'

export const BookkeepingOverview = ({
  title,
  showTitle = true,
  onClickReconnectAccounts,
  stringOverrides,
  slotProps,
}: BookkeepingOverviewProps) => {
  const [pnlToggle, setPnlToggle] = useState<PnlToggleOption>('expenses')
  const [width] = useWindowSize()
  const { isCalendlyVisible, calendlyLink, calendlyRef, closeCalendly } = useCalendly()

  const profitAndLossSummariesVariants =
    slotProps?.profitAndLoss?.summaries?.variants

  const { upperContentRef, targetElementRef, upperElementInFocus } =
    useKeepInMobileViewport()

  const handleBookCall = () => {} // TODO

  const { data: callBookings, isError, isLoading, isValidating } = useCallBookings(1)
  const callBooking: CallBookingData | null = callBookings?.[0]?.data[0] ?? null
  const callBookingVisible = callBooking && !isLoading && !isValidating && !isError

  return (
    <ProfitAndLoss asContainer={false}>
      <View
        viewClassName='Layer__bookkeeping-overview--view'
        title={stringOverrides?.title || title || 'Bookkeeping overview'}
        withSidebar={width > 1100}
        sidebar={(
          <VStack gap='lg'>
            {callBookingVisible && (
              <CallBooking callBooking={callBooking} onBookCall={handleBookCall} />
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
              {callBookingVisible && (
                <CallBooking callBooking={callBooking} onBookCall={handleBookCall} />
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
              text={stringOverrides?.profitAndLoss?.header || 'Profit & Loss'}
              withDatePicker
              withStatus
            />
            <BookkeepingProfitAndLossSummariesContainer>
              <ProfitAndLoss.Summaries
                stringOverrides={stringOverrides?.profitAndLoss?.summaries}
                variants={profitAndLossSummariesVariants}
              />
            </BookkeepingProfitAndLossSummariesContainer>
            <ProfitAndLoss.Chart />
          </Container>
        </div>
        <div className='Layer__bookkeeping-overview-profit-and-loss-charts'>
          <Toggle
            name='pnl-detailed-charts'
            options={[
              {
                value: 'revenue',
                label: 'Revenue',
              },
              {
                value: 'expenses',
                label: 'Expenses',
              },
            ]}
            selected={pnlToggle}
            onChange={e => setPnlToggle(e.target.value as PnlToggleOption)}
          />
          <Container
            name={classNames(
              'bookkeeping-overview-profit-and-loss-chart',
              pnlToggle !== 'revenue'
              && 'bookkeeping-overview-profit-and-loss-chart--hidden',
            )}
          >
            <ProfitAndLoss.DetailedCharts
              scope='revenue'
              hideClose={true}
              stringOverrides={stringOverrides?.profitAndLoss?.detailedCharts}
            />
          </Container>
          <Container
            name={classNames(
              'bookkeeping-overview-profit-and-loss-chart',
              pnlToggle !== 'expenses'
              && 'bookkeeping-overview-profit-and-loss-chart--hidden',
            )}
          >
            <ProfitAndLoss.DetailedCharts
              scope='expenses'
              hideClose={true}
              stringOverrides={stringOverrides?.profitAndLoss?.detailedCharts}
            />
          </Container>
        </div>
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
