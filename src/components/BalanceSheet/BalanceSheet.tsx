import { type PropsWithChildren, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type View as ViewType } from '@internal-types/general'
import { useBalanceSheet } from '@hooks/api/businesses/[business-id]/reports/balance-sheet/useBalanceSheet'
import { useReportsCompactHeader } from '@hooks/features/reports/useReportsCompactHeader'
import { useResolvedReportView } from '@hooks/features/reports/useResolvedReportView'
import { type DateSelectionMode, useGlobalDate } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { TableProvider } from '@contexts/TableContext/TableContext'
import { HStack, Stack } from '@ui/Stack/Stack'
import { BALANCE_SHEET_ROWS_CONFIG } from '@components/BalanceSheet/constants'
import { BalanceSheetDownloadButton } from '@components/BalanceSheet/download/BalanceSheetDownloadButton'
import { BalanceSheetTable } from '@components/BalanceSheetTable/BalanceSheetTable'
import { type BalanceSheetTableStringOverrides } from '@components/BalanceSheetTable/BalanceSheetTable'
import { CombinedDateSelection } from '@components/DateSelection/CombinedDateSelection'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { ReportsMobileSelectionTrigger } from '@components/ReportsNavigation/ReportsMobileSelectionTrigger'
import { ReportsTableErrorState } from '@components/ReportsTableState/ReportsTableErrorState'
import { ReportsTableLoader } from '@components/ReportsTableState/ReportsTableLoader'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'
import { View } from '@components/View/View'

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
  const { data, isLoading, isValidating, isError } = useBalanceSheet({ effectiveDate })
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
                      iconOnly={isMobileView}
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
