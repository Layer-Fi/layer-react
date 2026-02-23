import { useState } from 'react'
import classNames from 'classnames'
import { PopupModal } from 'react-calendly'

import { type CallBooking as CallBookingData } from '@schemas/callBookings'
import { type Variants } from '@utils/styleUtils/sizeVariants'
import { useCalendly } from '@hooks/useCalendly/useCalendly'
import { useSizeClass, useWindowSize } from '@hooks/useWindowSize/useWindowSize'
import { VStack } from '@ui/Stack/Stack'
import { Toggle } from '@ui/Toggle/Toggle'
import { CallBooking } from '@components/CallBooking/CallBooking'
import { Container } from '@components/Container/Container'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { ProfitAndLoss } from '@components/ProfitAndLoss/ProfitAndLoss'
import { type ProfitAndLossDetailedChartsStringOverrides } from '@components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { type ProfitAndLossSummariesStringOverrides } from '@components/ProfitAndLossSummaries/ProfitAndLossSummaries'
import { Tasks, type TasksStringOverrides } from '@components/Tasks/Tasks'
import { View } from '@components/View/View'
import { useCallBookings } from '@features/callBookings/api/useCallBookings'
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
  const { value: sizeClass } = useSizeClass()
  const { isCalendlyVisible, calendlyLink, calendlyRef, closeCalendly } = useCalendly()

  const profitAndLossSummariesVariants =
    slotProps?.profitAndLoss?.summaries?.variants

  const { upperContentRef, targetElementRef, upperElementInFocus } =
    useKeepInMobileViewport()

  const handleBookCall = () => {} // TODO

  const { data: callBookings, isError, isLoading, isValidating } = useCallBookings({ limit: 1 })
  const callBooking: CallBookingData | null = callBookings?.[0]?.data[0] ?? null
  const callBookingVisible = callBooking && !isLoading && !isValidating && !isError

  return (
    <ProfitAndLoss asContainer={false}>
      <View
        viewClassName='Layer__bookkeeping-overview--view'
        title={stringOverrides?.title || title || 'Bookkeeping overview'}
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
        <div className='Layer__bookkeeping-overview-profit-and-loss-charts'>
          <Toggle
            ariaLabel='Chart type'
            options={[
              {
                value: 'revenue',
                label: stringOverrides?.profitAndLoss?.detailedCharts?.detailedChartStringOverrides?.revenueToggleLabel || 'Revenue',
              },
              {
                value: 'expenses',
                label: stringOverrides?.profitAndLoss?.detailedCharts?.detailedChartStringOverrides?.expenseToggleLabel || 'Expenses',
              },
            ]}
            selectedKey={pnlToggle}
            onSelectionChange={key => setPnlToggle(key as PnlToggleOption)}
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
