import { type PropsWithChildren, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type View as ViewType } from '@internal-types/general'
import { useGetBalanceSheet } from '@api/businesses/[business-id]/reports/balance-sheet/get'
import { useReportsCompactHeader } from '@hooks/features/reports/useReportsCompactHeader'
import { useResolvedReportView } from '@hooks/features/reports/useResolvedReportView'
import { type DateSelectionMode, useGlobalDate } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { TableProvider } from '@contexts/TableContext/TableContext'
import { Header } from '@ui/Header/Header'
import { HeaderCol } from '@ui/Header/HeaderCol'
import { HeaderRow } from '@ui/Header/HeaderRow'
import { HStack, Stack } from '@ui/Stack/Stack'
import { CombinedDateSelection } from '@components/DateSelection/CombinedDateSelection'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'
import { View } from '@components/View/View'
import { BALANCE_SHEET_ROWS_CONFIG } from '@features/reports/BalanceSheet/constants'
import { BalanceSheetDownloadButton } from '@features/reports/BalanceSheetDownloadButton/BalanceSheetDownloadButton'
import { BalanceSheetTable } from '@features/reports/BalanceSheetTable/BalanceSheetTable'
import { type BalanceSheetTableStringOverrides } from '@features/reports/BalanceSheetTable/BalanceSheetTable'
import { ReportsMobileSelectionTrigger } from '@features/reports/ReportsMobileSelectionTrigger/ReportsMobileSelectionTrigger'
import { ReportsTableErrorState } from '@features/reports/ReportsTableErrorState/ReportsTableErrorState'
import { ReportsTableLoader } from '@features/reports/ReportsTableLoader/ReportsTableLoader'

export interface BalanceSheetStringOverrides {
  balanceSheetTable?: BalanceSheetTableStringOverrides
}

export type BalanceSheetViewProps = PropsWithChildren<{
  /** @deprecated No longer used. Expand all does not exist in Balance Sheet. */
  withExpandAllButton?: boolean
  view?: ViewType
  stringOverrides?: BalanceSheetStringOverrides
  dateSelectionMode?: DateSelectionMode
}>

export type BalanceSheetProps = PropsWithChildren<{
  effectiveDate?: Date
  /** @deprecated No longer used. Expand all does not exist in Balance Sheet. */
  withExpandAllButton?: boolean
  view?: ViewType
  stringOverrides?: BalanceSheetStringOverrides
  dateSelectionMode?: DateSelectionMode
}>

export const BalanceSheet = (props: BalanceSheetProps) => {
  return (
    <BalanceSheetView
      stringOverrides={props.stringOverrides}
      {...props}
    />
  )
}

const BalanceSheetView = ({
  view: propView,
  stringOverrides,
  dateSelectionMode = 'full',
}: BalanceSheetViewProps) => {
  const { t } = useTranslation()
  const { date: effectiveDate } = useGlobalDate({ dateSelectionMode })
  const { data, isLoading, isValidating, isError } = useGetBalanceSheet({ effectiveDate })
  const { containerRef, isMobileView } = useResolvedReportView(propView)
  const { headerRef, isCompact } = useReportsCompactHeader()

  const balanceSheetRows = useMemo(
    () => BALANCE_SHEET_ROWS_CONFIG.map(row => ({
      ...row,
      displayName: t(row.i18nKey, row.defaultValue),
    })),
    [t],
  )

  const content = (
    <ConditionalBlock
      data={data}
      isLoading={isLoading}
      isError={isError}
      Loading={(
        <ReportsTableLoader
          typeColumnHeader={stringOverrides?.balanceSheetTable?.typeColumnHeader}
          totalColumnHeader={stringOverrides?.balanceSheetTable?.totalColumnHeader}
        />
      )}
      Error={(
        <ReportsTableErrorState
          isLoading={isValidating}
        />
      )}
    >
      {({ data }) => (
        <BalanceSheetTable
          data={data}
          config={balanceSheetRows}
          stringOverrides={stringOverrides?.balanceSheetTable}
        />
      )}
    </ConditionalBlock>
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
                  <CombinedDateSelection mode={dateSelectionMode} isCompact={isCompact} />
                  <HStack gap='xs' justify='end' fluid={isCompact}>
                    {isMobileView && <ReportsMobileSelectionTrigger />}
                    <BalanceSheetDownloadButton
                      effectiveDate={effectiveDate}
                      icon={isMobileView}
                    />
                  </HStack>
                </Stack>
              </HeaderCol>
            </HeaderRow>
          </Header>
        )}
      >
        {content}
      </View>
    </TableProvider>
  )
}
