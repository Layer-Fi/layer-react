import { type PropsWithChildren, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useBalanceSheet } from '@hooks/api/businesses/[business-id]/reports/balance-sheet/useBalanceSheet'
import { useElementViewSize } from '@hooks/utils/size/useElementViewSize'
import { type DateSelectionMode, useGlobalDate } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { TableProvider } from '@contexts/TableContext/TableContext'
import { HStack } from '@ui/Stack/Stack'
import { BALANCE_SHEET_ROWS_CONFIG } from '@components/BalanceSheet/constants'
import { BalanceSheetDownloadButton } from '@components/BalanceSheet/download/BalanceSheetDownloadButton'
import { BalanceSheetExpandAllButton } from '@components/BalanceSheetExpandAllButton/BalanceSheetExpandAllButton'
import { BalanceSheetTable } from '@components/BalanceSheetTable/BalanceSheetTable'
import { type BalanceSheetTableStringOverrides } from '@components/BalanceSheetTable/BalanceSheetTable'
import { Container } from '@components/Container/Container'
import { CombinedDateSelection } from '@components/DateSelection/CombinedDateSelection'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { ReportsTableErrorState } from '@components/ReportsTableState/ReportsTableErrorState'
import { ReportsTableLoader } from '@components/ReportsTableState/ReportsTableLoader'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'
import { View } from '@components/View/View'

export interface BalanceSheetStringOverrides {
  balanceSheetTable?: BalanceSheetTableStringOverrides
}

export type BalanceSheetViewProps = PropsWithChildren<{
  withExpandAllButton?: boolean
  asWidget?: boolean
  stringOverrides?: BalanceSheetStringOverrides
  dateSelectionMode?: DateSelectionMode
}>

export type BalanceSheetProps = PropsWithChildren<{
  effectiveDate?: Date
  asWidget?: boolean
  stringOverrides?: BalanceSheetStringOverrides
  dateSelectionMode?: DateSelectionMode
}>

const COMPONENT_NAME = 'balance-sheet'

export const BalanceSheet = (props: BalanceSheetProps) => {
  return (
    <BalanceSheetView
      asWidget={props.asWidget}
      stringOverrides={props.stringOverrides}
      {...props}
    />
  )
}

const BalanceSheetView = ({
  withExpandAllButton = true,
  asWidget = false,
  stringOverrides,
  dateSelectionMode = 'full',
}: BalanceSheetViewProps) => {
  const { t } = useTranslation()
  const { date: effectiveDate } = useGlobalDate({ dateSelectionMode })
  const { data, isLoading, isValidating, isError } = useBalanceSheet({ effectiveDate })
  const { view, containerRef } = useElementViewSize<HTMLDivElement>()
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

  if (asWidget) {
    return (
      <TableProvider>
        <Container name={COMPONENT_NAME} asWidget={true}>
          <View
            type='panel'
            ref={containerRef}
            header={(
              <Header>
                <HeaderRow>
                  <HeaderCol fluid>
                    <HStack pb='sm' align='end' gap='xs' justify='space-between' fluid>
                      <CombinedDateSelection mode={dateSelectionMode} />
                      {withExpandAllButton && (
                        <BalanceSheetExpandAllButton view={view} />
                      )}
                    </HStack>
                  </HeaderCol>
                </HeaderRow>
              </Header>
            )}
          >
            {content}
          </View>
        </Container>
      </TableProvider>
    )
  }

  return (
    <TableProvider>
      <View
        type='panel'
        ref={containerRef}
        header={(
          <Header>
            <HeaderRow>
              <HeaderCol fluid>
                <HStack pb='sm' align='end' gap='xs' justify='space-between' fluid>
                  <CombinedDateSelection mode={dateSelectionMode} />
                  <HStack gap='xs'>
                    {withExpandAllButton && (
                      <BalanceSheetExpandAllButton view={view} />
                    )}
                    <BalanceSheetDownloadButton
                      effectiveDate={effectiveDate}
                      iconOnly={view === 'mobile'}
                    />
                  </HStack>
                </HStack>
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
