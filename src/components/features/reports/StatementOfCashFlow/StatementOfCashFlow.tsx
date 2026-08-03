import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type View as ViewType } from '@internal-types/general'
import type { TimeRangePickerConfig } from '@internal-types/reports'
import { useGetStatementOfCashFlow } from '@api/businesses/[business-id]/reports/cashflow-statement/get'
import { useReportsCompactHeader } from '@hooks/features/reports/useReportsCompactHeader'
import { useResolvedReportView } from '@hooks/features/reports/useResolvedReportView'
import { useGlobalDateRange } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { TableProvider } from '@contexts/TableContext/TableContext'
import { Header } from '@ui/Header/Header'
import { HeaderCol } from '@ui/Header/HeaderCol'
import { HeaderRow } from '@ui/Header/HeaderRow'
import { HStack, Stack } from '@ui/Stack/Stack'
import { CombinedDateRangeSelection } from '@components/DateSelection/CombinedDateRangeSelection'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'
import { View } from '@components/View/View'
import { CashflowStatementDownloadButton } from '@features/reports/CashflowStatementDownloadButton/CashflowStatementDownloadButton'
import { ReportsMobileSelectionTrigger } from '@features/reports/ReportsMobileSelectionTrigger/ReportsMobileSelectionTrigger'
import { ReportsTableErrorState } from '@features/reports/ReportsTableErrorState/ReportsTableErrorState'
import { ReportsTableLoader } from '@features/reports/ReportsTableLoader/ReportsTableLoader'
import { STATEMENT_OF_CASH_FLOW_ROWS_CONFIG } from '@features/reports/StatementOfCashFlow/constants'
import { StatementOfCashFlowTable } from '@features/reports/StatementOfCashFlowTable/StatementOfCashFlowTable'
import { type StatementOfCashFlowTableStringOverrides } from '@features/reports/StatementOfCashFlowTable/StatementOfCashFlowTable'

export interface StatementOfCashFlowStringOverrides {
  statementOfCashFlowTable?: StatementOfCashFlowTableStringOverrides
}

export type StatementOfCashFlowProps = TimeRangePickerConfig & {
  view?: ViewType
  stringOverrides?: StatementOfCashFlowStringOverrides
}

export const StatementOfCashFlow = (props: StatementOfCashFlowProps) => {
  return (
    <StatementOfCashFlowView {...props} />
  )
}

type StatementOfCashFlowViewProps = TimeRangePickerConfig & {
  view?: ViewType
  stringOverrides?: StatementOfCashFlowStringOverrides
}

const StatementOfCashFlowView = ({
  view: propView,
  stringOverrides,
  dateSelectionMode = 'full',
}: StatementOfCashFlowViewProps) => {
  const { t } = useTranslation()
  const dateRange = useGlobalDateRange({ dateSelectionMode })
  const { data, isLoading, isValidating, isError } = useGetStatementOfCashFlow(dateRange)
  const { containerRef, isMobileView } = useResolvedReportView(propView)
  const { headerRef, isCompact } = useReportsCompactHeader()
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
          <Header ref={headerRef}>
            <HeaderRow>
              <HeaderCol fluid>
                <Stack
                  direction={isCompact ? 'column-reverse' : 'row'}
                  align={isCompact ? undefined : 'end'}
                  justify='space-between'
                  gap='xs'
                  pb='sm'
                  fluid
                >
                  <CombinedDateRangeSelection mode={dateSelectionMode} isCompact={isCompact} />
                  <HStack gap='xs' justify='end' fluid={isCompact}>
                    {isMobileView && <ReportsMobileSelectionTrigger />}
                    <CashflowStatementDownloadButton
                      startDate={dateRange.startDate}
                      endDate={dateRange.endDate}
                      icon={isMobileView}
                    />
                  </HStack>
                </Stack>
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
