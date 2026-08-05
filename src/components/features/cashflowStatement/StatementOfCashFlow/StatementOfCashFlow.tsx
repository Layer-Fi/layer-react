import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { TimeRangePickerConfig } from '@internal-types/reports'
import { type View as ViewType } from '@internal-types/shared/viewport'
import { useGetStatementOfCashFlow } from '@api/businesses/[business-id]/reports/cashflow-statement/get'
import { useReportsCompactHeader } from '@hooks/features/reports/useReportsCompactHeader'
import { useResolvedReportView } from '@hooks/features/reports/useResolvedReportView'
import { useGlobalDateRange } from '@providers/global/GlobalDateStore/GlobalDateStoreProvider'
import { ReportsTableProvider } from '@providers/reports/ReportsTableContext/ReportsTableContext'
import { HStack, Stack } from '@ui/Stack/Stack'
import { CombinedDateRangeSelection } from '@blocks/DatePickers/DateSelection/CombinedDateRangeSelection'
import { Header } from '@blocks/Layout/Header/Header'
import { HeaderCol } from '@blocks/Layout/Header/HeaderCol'
import { HeaderRow } from '@blocks/Layout/Header/HeaderRow'
import { View } from '@blocks/Layout/View/View'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'
import { CashflowStatementDownloadButton } from '@features/cashflowStatement/CashflowStatementDownloadButton/CashflowStatementDownloadButton'
import { STATEMENT_OF_CASH_FLOW_ROWS_CONFIG } from '@features/cashflowStatement/StatementOfCashFlow/constants'
import { StatementOfCashFlowTable } from '@features/cashflowStatement/StatementOfCashFlowTable/StatementOfCashFlowTable'
import { type StatementOfCashFlowTableStringOverrides } from '@features/cashflowStatement/StatementOfCashFlowTable/StatementOfCashFlowTable'
import { ReportsMobileSelectionTrigger } from '@features/reports/ReportsMobileSelectionTrigger/ReportsMobileSelectionTrigger'
import { ReportsTableErrorState } from '@features/reports/ReportsTableErrorState/ReportsTableErrorState'
import { ReportsTableLoader } from '@features/reports/ReportsTableLoader/ReportsTableLoader'

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
    <ReportsTableProvider>
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
    </ReportsTableProvider>
  )
}
