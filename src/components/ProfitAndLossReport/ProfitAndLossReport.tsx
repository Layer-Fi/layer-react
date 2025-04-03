import { RefObject, useContext } from 'react'
import { View as ViewType } from '../../types/general'
import { ReportsStringOverrides } from '../../views/Reports/Reports'
import type { TimeRangePickerConfig } from '../../views/Reports/reportTypes'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { Panel } from '../Panel'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { View } from '../View'
import { BookkeepingStatusPanelNotification } from '../BookkeepingStatus/BookkeepingStatusPanelNotification'
import { useBookkeepingPeriodStatus } from '../../hooks/bookkeeping/periods/useBookkeepingPeriodStatus'
import { BookkeepingStatus } from '../BookkeepingStatus/BookkeepingStatus'
import { Text, TextSize } from '../Typography/Text'
import { format, getMonth } from 'date-fns'
import { HStack, VStack } from '../ui/Stack/Stack'
import { Button } from '../Button'
import pluralize from 'pluralize'
import { isComplete } from '../../types/tasks'

type ViewBreakpoint = ViewType | undefined

export type ProfitAndLossReportProps = {
  stringOverrides?: ReportsStringOverrides
  parentRef?: RefObject<HTMLDivElement>
  view?: ViewBreakpoint
  redirectToBookkeepingTasks?: () => void
} & TimeRangePickerConfig

/** @TODO - move to separate file */
const BookkeepingStatusRow = ({ redirectToBookkeepingTasks }: Pick<ProfitAndLossReportProps, 'redirectToBookkeepingTasks'>) => {
  const { dateRange } = useContext(ProfitAndLoss.Context)
  const { status, data } = useBookkeepingPeriodStatus({ currentMonthDate: dateRange.startDate })

  if (!status) {
    return null
  }

  const unresolvedTasksCount = data?.tasks.filter(task => isComplete(task.status)).length

  const buildAction = () => {
    switch (status) {
      case 'NOT_STARTED':
      case 'IN_PROGRESS_AWAITING_BOOKKEEPER':
      case 'CLOSING_IN_REVIEW':
        return (
          <Text size={TextSize.sm} status='disabled' className='Layer__profit-and-loss-header-row-text'>
            {`Bookkeeping team is preparing your ${format(dateRange.startDate, 'MMMM')} report. The report can change and current numbers might not be final.`}
          </Text>
        )
      case 'IN_PROGRESS_AWAITING_CUSTOMER':
      case 'CLOSED_OPEN_TASKS':
        return (
          <HStack gap='xs'>
            <Text size={TextSize.sm} status='disabled' className='Layer__profit-and-loss-header-row-text'>
              {`Bookkeeping team is preparing your ${format(dateRange.startDate, 'MMMM')} report.You have ${pluralize('task', unresolvedTasksCount, true)} awaiting your response.`}
            </Text>
            <Button onClick={redirectToBookkeepingTasks}>{`Complete ${format(dateRange.startDate, 'MMMM')} tasks`}</Button>
          </HStack>
        )
      default:
        return
    }
  }

  return (
    <HeaderRow>
      <HeaderCol>
        <VStack gap='3xs'>
          <Text size={TextSize.lg}>{format(dateRange.startDate, 'MMMM yyyy')}</Text>
          <BookkeepingStatus status={status} month={getMonth(dateRange.startDate) + 1} />
        </VStack>
      </HeaderCol>
      <HeaderCol>
        {buildAction()}
      </HeaderCol>
    </HeaderRow>
  )
}

export const ProfitAndLossReport = ({
  stringOverrides,
  allowedDatePickerModes,
  datePickerMode,
  defaultDatePickerMode,
  customDateRanges,
  csvMoneyFormat,
  parentRef,
  view,
  redirectToBookkeepingTasks,
}: ProfitAndLossReportProps) => {
  const { sidebarScope } = useContext(ProfitAndLoss.Context)
  const { comparisonConfig } = useContext(ProfitAndLoss.ComparisonContext)

  return (
    <View
      type='panel'
      notification={<BookkeepingStatusPanelNotification onClick={redirectToBookkeepingTasks} />}
      header={(
        <Header>
          <HeaderRow>
            <HeaderCol>
              <>
                <ProfitAndLoss.DatePicker
                  allowedDatePickerModes={allowedDatePickerModes}
                  datePickerMode={datePickerMode}
                  defaultDatePickerMode={defaultDatePickerMode}
                  customDateRanges={customDateRanges}
                />
                {view === 'desktop'
                  ? (
                    <ProfitAndLoss.CompareOptions />
                  )
                  : null}
              </>
            </HeaderCol>
            <HeaderCol>
              <ProfitAndLoss.DownloadButton
                stringOverrides={stringOverrides?.downloadButton}
                useComparisonPnl={!!comparisonConfig}
                moneyFormat={csvMoneyFormat}
                view={view}
              />
            </HeaderCol>
          </HeaderRow>
          {view !== 'desktop'
            ? (
              <HeaderRow>
                <HeaderCol>
                  <ProfitAndLoss.CompareOptions />
                </HeaderCol>
              </HeaderRow>
            )
            : null}
          <BookkeepingStatusRow redirectToBookkeepingTasks={redirectToBookkeepingTasks} />
        </Header>
      )}
    >
      <Panel
        sidebar={(
          <ProfitAndLoss.DetailedCharts
            showDatePicker={false}
            stringOverrides={stringOverrides?.profitAndLoss?.detailedCharts}
          />
        )}
        sidebarIsOpen={Boolean(sidebarScope)}
        parentRef={parentRef}
      >
        <ProfitAndLoss.Table
          asContainer={false}
          stringOverrides={stringOverrides?.profitAndLoss?.table}
        />
      </Panel>
    </View>
  )
}
