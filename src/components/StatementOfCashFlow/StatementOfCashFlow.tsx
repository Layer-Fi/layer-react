import { useMemo } from 'react'

import { useStatementOfCashFlow } from '@hooks/useStatementOfCashFlow/useStatementOfCashFlow'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { TableProvider } from '@contexts/TableContext/TableContext'
import { CombinedDateRangeSelection } from '@components/DateSelection/CombinedDateRangeSelection'
import { DateRangePickers } from '@components/DateSelection/DateRangePickers'
import { DateSelectionComboBox } from '@components/DateSelection/DateSelectionComboBox'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { Loader } from '@components/Loader/Loader'
import { STATEMENT_OF_CASH_FLOW_ROWS } from '@components/StatementOfCashFlow/constants'
import { CashflowStatementDownloadButton } from '@components/StatementOfCashFlow/download/CashflowStatementDownloadButton'
import { StatementOfCashFlowTable } from '@components/StatementOfCashFlowTable/StatementOfCashFlowTable'
import { type StatementOfCashFlowTableStringOverrides } from '@components/StatementOfCashFlowTable/StatementOfCashFlowTable'
import { View } from '@components/View/View'
import type { TimeRangePickerConfig } from '@views/Reports/reportTypes'

const COMPONENT_NAME = 'statement-of-cash-flow'

export interface StatementOfCashFlowStringOverrides {
  statementOfCashFlowTable?: StatementOfCashFlowTableStringOverrides
}

export type StatementOfCashFlowProps = TimeRangePickerConfig & {
  stringOverrides?: StatementOfCashFlowStringOverrides
}

export const StatementOfCashFlow = (props: StatementOfCashFlowProps) => {
  return (
    <StatementOfCashFlowView {...props} />
  )
}

type StatementOfCashFlowViewProps = TimeRangePickerConfig & {
  stringOverrides?: StatementOfCashFlowStringOverrides
}

const StatementOfCashFlowView = ({
  stringOverrides,
  dateSelectionMode = 'full',
}: StatementOfCashFlowViewProps) => {
  const dateRange = useGlobalDateRange({ displayMode: dateSelectionMode })
  const { data, isLoading } = useStatementOfCashFlow(dateRange)
  const { value: view } = useSizeClass()

  const header = useMemo(() => {
    const isMobile = view !== 'desktop'
    const isFullDateMode = dateSelectionMode === 'full'

    if (isMobile && isFullDateMode) {
      return (
        <Header>
          <HeaderRow>
            <HeaderCol style={{ flex: 1 }}>
              <DateSelectionComboBox />
            </HeaderCol>
            <HeaderCol style={{ flex: 0 }}>
              <CashflowStatementDownloadButton
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                iconOnly={isMobile}
              />
            </HeaderCol>
          </HeaderRow>
          <HeaderRow>
            <HeaderCol>
              <DateRangePickers />
            </HeaderCol>
          </HeaderRow>
        </Header>
      )
    }

    return (
      <Header>
        <HeaderRow>
          <HeaderCol>
            <CombinedDateRangeSelection mode={dateSelectionMode} />
          </HeaderCol>
          <HeaderCol>
            <CashflowStatementDownloadButton
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
            />
          </HeaderCol>
        </HeaderRow>
      </Header>
    )
  }, [dateRange.startDate, dateRange.endDate, dateSelectionMode, view])

  return (
    <TableProvider>
      <View type='panel' header={header}>
        {!data || isLoading
          ? (
            <div className={`Layer__${COMPONENT_NAME}__loader-container`}>
              <Loader />
            </div>
          )
          : (
            <StatementOfCashFlowTable
              data={data}
              config={STATEMENT_OF_CASH_FLOW_ROWS}
              stringOverrides={stringOverrides?.statementOfCashFlowTable}
            />
          )}
      </View>
    </TableProvider>
  )
}
