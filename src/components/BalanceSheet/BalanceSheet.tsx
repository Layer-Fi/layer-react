import { type PropsWithChildren } from 'react'

import { useBalanceSheet } from '@hooks/balanceSheet/useBalanceSheet'
import { useElementViewSize } from '@hooks/useElementViewSize/useElementViewSize'
import { type DateSelectionMode, useGlobalDate } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { TableProvider } from '@contexts/TableContext/TableContext'
import { BALANCE_SHEET_ROWS } from '@components/BalanceSheet/constants'
import { BalanceSheetDownloadButton } from '@components/BalanceSheet/download/BalanceSheetDownloadButton'
import { BalanceSheetExpandAllButton } from '@components/BalanceSheetExpandAllButton/BalanceSheetExpandAllButton'
import { BalanceSheetTable } from '@components/BalanceSheetTable/BalanceSheetTable'
import { type BalanceSheetTableStringOverrides } from '@components/BalanceSheetTable/BalanceSheetTable'
import { Container } from '@components/Container/Container'
import { CombinedDateSelection } from '@components/DateSelection/CombinedDateSelection'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { Loader } from '@components/Loader/Loader'
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
  const { date: effectiveDate } = useGlobalDate({ dateSelectionMode: dateSelectionMode })
  const { data, isLoading } = useBalanceSheet({ effectiveDate })
  const { view, containerRef } = useElementViewSize<HTMLDivElement>()

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
                  <HeaderCol>
                    <CombinedDateSelection mode={dateSelectionMode} />
                  </HeaderCol>
                  {withExpandAllButton && (
                    <HeaderCol>
                      <BalanceSheetExpandAllButton view={view} />
                    </HeaderCol>
                  )}
                </HeaderRow>
              </Header>
            )}
          >
            {!data || isLoading
              ? (
                <div className={`Layer__${COMPONENT_NAME}__loader-container`}>
                  <Loader />
                </div>
              )
              : (
                <BalanceSheetTable
                  data={data}
                  config={BALANCE_SHEET_ROWS}
                  stringOverrides={stringOverrides?.balanceSheetTable}
                />
              )}
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
              <HeaderCol>
                <CombinedDateSelection mode={dateSelectionMode} />
              </HeaderCol>
              <HeaderCol>
                {withExpandAllButton && (
                  <BalanceSheetExpandAllButton view={view} />
                )}
                <BalanceSheetDownloadButton
                  effectiveDate={effectiveDate}
                  iconOnly={view === 'mobile'}
                />
              </HeaderCol>
            </HeaderRow>
          </Header>
        )}
      >
        {!data || isLoading
          ? (
            <div className={`Layer__${COMPONENT_NAME}__loader-container`}>
              <Loader />
            </div>
          )
          : (
            <BalanceSheetTable
              data={data}
              config={BALANCE_SHEET_ROWS}
              stringOverrides={stringOverrides?.balanceSheetTable}
            />
          )}
      </View>
    </TableProvider>
  )
}
