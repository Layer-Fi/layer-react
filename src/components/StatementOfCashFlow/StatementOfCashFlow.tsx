import { useElementViewSize } from '@hooks/useElementViewSize/useElementViewSize'
import { useStatementOfCashFlow } from '@hooks/useStatementOfCashFlow/useStatementOfCashFlow'
import { useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { TableProvider } from '@contexts/TableContext/TableContext'
import { HStack } from '@ui/Stack/Stack'
import { CombinedDateRangeSelection } from '@components/DateSelection/CombinedDateRangeSelection'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { ReportsTableErrorState, ReportsTableLoader } from '@components/ReportsTableState/ReportsTableState'
import { STATEMENT_OF_CASH_FLOW_ROWS } from '@components/StatementOfCashFlow/constants'
import { CashflowStatementDownloadButton } from '@components/StatementOfCashFlow/download/CashflowStatementDownloadButton'
import { StatementOfCashFlowTable } from '@components/StatementOfCashFlowTable/StatementOfCashFlowTable'
import { type StatementOfCashFlowTableStringOverrides } from '@components/StatementOfCashFlowTable/StatementOfCashFlowTable'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'
import { View } from '@components/View/View'
import type { TimeRangePickerConfig } from '@views/Reports/reportTypes'

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
  const dateRange = useGlobalDateRange({ dateSelectionMode })
  const { data, isLoading, isValidating, error } = useStatementOfCashFlow(dateRange)
  const { view, containerRef } = useElementViewSize<HTMLDivElement>()

  return (
    <TableProvider>
      <View
        type='panel'
        ref={containerRef}
        header={(
          <Header>
            <HeaderRow>
              <HeaderCol fluid>
                <HStack pb='sm' align='end' fluid gap='xs' justify='space-between'>
                  <CombinedDateRangeSelection mode={dateSelectionMode} />
                  <CashflowStatementDownloadButton
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                    iconOnly={view === 'mobile'}
                  />
                </HStack>
              </HeaderCol>
            </HeaderRow>
          </Header>
        )}
      >
        <ConditionalBlock
          data={data}
          isLoading={isLoading}
          isError={Boolean(error)}
          Loading={(
            <ReportsTableLoader
              typeColumnHeader={stringOverrides?.statementOfCashFlowTable?.typeColumnHeader}
              totalColumnHeader={stringOverrides?.statementOfCashFlowTable?.totalColumnHeader}
            />
          )}
          Inactive={null}
          Error={(
            <ReportsTableErrorState
              isLoading={isValidating}
            />
          )}
        >
          {({ data }) => (
            <StatementOfCashFlowTable
              data={data}
              config={STATEMENT_OF_CASH_FLOW_ROWS}
              stringOverrides={stringOverrides?.statementOfCashFlowTable}
            />
          )}
        </ConditionalBlock>
      </View>
    </TableProvider>
  )
}
