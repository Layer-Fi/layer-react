import { type PropsWithChildren, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type View as ViewType } from '@internal-types/shared/view'
import { type DateSelectionMode, useGlobalDate } from '@providers/global/GlobalDateStore/GlobalDateStoreProvider'
import { useGetBalanceSheet } from '@api/businesses/[business-id]/reports/balance-sheet/get'
import { ReportsTableProvider } from '@providers/features/reports/ReportsTableContext/ReportsTableContext'
import { useReportsCompactHeader } from '@hooks/features/reports/useReportsCompactHeader'
import { useResolvedReportView } from '@hooks/features/reports/useResolvedReportView'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'
import { HStack, Stack } from '@ui/Stack/Stack'
import { CombinedDateSelection } from '@blocks/DatePickers/DateSelection/CombinedDateSelection'
import { Header } from '@blocks/Layout/Header/Header'
import { HeaderCol } from '@blocks/Layout/Header/HeaderCol'
import { HeaderRow } from '@blocks/Layout/Header/HeaderRow'
import { View } from '@blocks/Layout/View/View'
import { BALANCE_SHEET_ROWS_CONFIG } from '@features/balanceSheet/BalanceSheet/constants'
import { BalanceSheetDownloadButton } from '@features/balanceSheet/BalanceSheetDownloadButton/BalanceSheetDownloadButton'
import { BalanceSheetTable } from '@features/balanceSheet/BalanceSheetTable/BalanceSheetTable'
import { type BalanceSheetTableStringOverrides } from '@features/balanceSheet/BalanceSheetTable/BalanceSheetTable'
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
    </ReportsTableProvider>
  )
}
