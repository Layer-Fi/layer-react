import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useStatementOfCashFlow } from '@hooks/api/businesses/[business-id]/reports/cashflow-statement/useStatementOfCashFlow'
import { useElementViewSize } from '@hooks/utils/size/useElementViewSize'
import { useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { TableProvider } from '@contexts/TableContext/TableContext'
import { HStack } from '@ui/Stack/Stack'
import { CombinedDateRangeSelection } from '@components/DateSelection/CombinedDateRangeSelection'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { ReportsTableErrorState } from '@components/ReportsTableState/ReportsTableErrorState'
import { ReportsTableLoader } from '@components/ReportsTableState/ReportsTableLoader'
import { STATEMENT_OF_CASH_FLOW_ROWS_CONFIG } from '@components/StatementOfCashFlow/constants'
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
  const { t } = useTranslation()
  const dateRange = useGlobalDateRange({ dateSelectionMode })
  const { data, isLoading, isValidating, isError } = useStatementOfCashFlow(dateRange)
  const { view, containerRef } = useElementViewSize<HTMLDivElement>()
  const isMobileView = view === 'mobile'
  const tableStringOverrides = stringOverrides?.statementOfCashFlowTable
  const statementOfCashFlowRows = useMemo(
    () => STATEMENT_OF_CASH_FLOW_ROWS_CONFIG.map(row => ({
      ...row,
      displayName: t(row.i18nKey, row.defaultValue),
    })),
    [t],
  )

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
                    iconOnly={isMobileView}
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
          isError={isError}
          Loading={(
            <ReportsTableLoader
              typeColumnHeader={tableStringOverrides?.typeColumnHeader}
              totalColumnHeader={tableStringOverrides?.totalColumnHeader}
            />
          )}
          Inactive={null}
          Error={(
            <ReportsTableErrorState
              isLoading={isValidating}
            />
          )}
        >
          {({ data }) => ((
            statementOfCashFlowData: NonNullable<typeof data>,
          ) => (
            <StatementOfCashFlowTable
              data={statementOfCashFlowData}
              config={statementOfCashFlowRows}
              stringOverrides={tableStringOverrides}
            />
          ))(data)}
        </ConditionalBlock>
      </View>
    </TableProvider>
  )
}
