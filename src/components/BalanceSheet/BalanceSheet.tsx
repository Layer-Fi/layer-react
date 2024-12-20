import React, { PropsWithChildren, useEffect, useState } from 'react'
import { BalanceSheetContext } from '../../contexts/BalanceSheetContext'
import { TableProvider } from '../../contexts/TableContext'
import { useBalanceSheet } from '../../hooks/useBalanceSheet'
import { useElementViewSize } from '../../hooks/useElementViewSize/useElementViewSize'
import { BalanceSheetDatePicker } from '../BalanceSheetDatePicker'
import { BalanceSheetExpandAllButton } from '../BalanceSheetExpandAllButton'
import { BalanceSheetTable } from '../BalanceSheetTable'
import { BalanceSheetTableStringOverrides } from '../BalanceSheetTable/BalanceSheetTable'
import { Container } from '../Container'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { Loader } from '../Loader'
import { View } from '../View'
import { BALANCE_SHEET_ROWS } from './constants'
import { format, parse, startOfDay } from 'date-fns'
import { BalanceSheetDownloadButton } from './download/BalanceSheetDownloadButton'

export interface BalanceSheetStringOverrides {
  balanceSheetTable?: BalanceSheetTableStringOverrides
}

export type BalanceSheetViewProps = PropsWithChildren & {
  withExpandAllButton?: boolean
  asWidget?: boolean
  stringOverrides?: BalanceSheetStringOverrides
}

export type BalanceSheetProps = PropsWithChildren & {
  effectiveDate?: Date
  asWidget?: boolean
  stringOverrides?: BalanceSheetStringOverrides
}

const COMPONENT_NAME = 'balance-sheet'

export const BalanceSheet = (props: BalanceSheetProps) => {
  const balanceSheetContextData = useBalanceSheet(props.effectiveDate)
  return (
    <BalanceSheetContext.Provider value={balanceSheetContextData}>
      <BalanceSheetView
        asWidget={props.asWidget}
        stringOverrides={props.stringOverrides}
        {...props}
      />
    </BalanceSheetContext.Provider>
  )
}

const BalanceSheetView = ({
  withExpandAllButton = true,
  asWidget = false,
  stringOverrides,
}: BalanceSheetViewProps) => {
  const [effectiveDate, setEffectiveDate] = useState(startOfDay(new Date()))
  const { data, isLoading, refetch } = useBalanceSheet(effectiveDate)
  const { view, containerRef } = useElementViewSize<HTMLDivElement>()

  useEffect(() => {
    // Refetch only if selected effectiveDate and data's effectiveDate are different
    const d1 =
      effectiveDate
      && format(startOfDay(effectiveDate), 'yyyy-MM-dd\'T\'HH:mm:ssXXX')
    const d2 =
      data?.effective_date
      && format(
        startOfDay(
          parse(data.effective_date, 'yyyy-MM-dd\'T\'HH:mm:ssXXX', new Date()),
        ),
        'yyyy-MM-dd\'T\'HH:mm:ssXXX',
      )
    if (d1 && (!d2 || (d2 && d2 !== d1))) {
      refetch()
    }
  }, [effectiveDate])

  if (asWidget) {
    return (
      <TableProvider>
        <Container name={COMPONENT_NAME} asWidget={true}>
          <View
            type='panel'
            ref={containerRef}
            header={
              <Header>
                <HeaderRow>
                  <HeaderCol>
                    <BalanceSheetDatePicker
                      effectiveDate={effectiveDate}
                      setEffectiveDate={setEffectiveDate}
                    />
                  </HeaderCol>
                  {withExpandAllButton && (
                    <HeaderCol>
                      <BalanceSheetExpandAllButton view={view} />
                    </HeaderCol>
                  )}
                </HeaderRow>
              </Header>
            }
          >
            {!data || isLoading ? (
              <div className={`Layer__${COMPONENT_NAME}__loader-container`}>
                <Loader />
              </div>
            ) : (
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
        header={
          <Header>
            <HeaderRow>
              <HeaderCol>
                <BalanceSheetDatePicker
                  effectiveDate={effectiveDate}
                  setEffectiveDate={setEffectiveDate}
                />
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
        }
      >
        {!data || isLoading ? (
          <div className={`Layer__${COMPONENT_NAME}__loader-container`}>
            <Loader />
          </div>
        ) : (
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
