import { PropsWithChildren } from 'react'
import { TableProvider } from '../../contexts/TableContext'
import { useBalanceSheet } from '../../hooks/balanceSheet/useBalanceSheet'
import { useElementViewSize } from '../../hooks/useElementViewSize/useElementViewSize'
import { BalanceSheetDatePicker } from '../BalanceSheetDatePicker/BalanceSheetDatePicker'
import { BalanceSheetExpandAllButton } from '../BalanceSheetExpandAllButton'
import { BalanceSheetTable } from '../BalanceSheetTable'
import { BalanceSheetTableStringOverrides } from '../BalanceSheetTable/BalanceSheetTable'
import { Container } from '../Container'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { Loader } from '../Loader'
import { View } from '../View'
import { BALANCE_SHEET_ROWS } from './constants'
import { BalanceSheetDownloadButton } from './download/BalanceSheetDownloadButton'
import { useGlobalDate } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { BookkeepingStatusPanelNotification } from '../BookkeepingStatus/BookkeepingStatusPanelNotification'
import { BookkeepingStatusReportRow } from '../BookkeepingStatus/BookkeepingStatusReportRow'

export interface BalanceSheetStringOverrides {
  balanceSheetTable?: BalanceSheetTableStringOverrides
}

export type BalanceSheetViewProps = PropsWithChildren & {
  withExpandAllButton?: boolean
  asWidget?: boolean
  stringOverrides?: BalanceSheetStringOverrides
  onViewBookkeepingTasks?: () => void
}

export type BalanceSheetProps = PropsWithChildren & {
  effectiveDate?: Date
  asWidget?: boolean
  stringOverrides?: BalanceSheetStringOverrides
  onViewBookkeepingTasks?: () => void
}

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
  onViewBookkeepingTasks,
}: BalanceSheetViewProps) => {
  const { date: effectiveDate } = useGlobalDate()
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
                    <BalanceSheetDatePicker />
                  </HeaderCol>
                  {withExpandAllButton && (
                    <HeaderCol>
                      <BalanceSheetExpandAllButton view={view} />
                    </HeaderCol>
                  )}
                </HeaderRow>
                <BookkeepingStatusReportRow currentDate={effectiveDate} onViewBookkeepingTasks={onViewBookkeepingTasks} />
              </Header>
            )}
            notification={<BookkeepingStatusPanelNotification onClick={onViewBookkeepingTasks} />}
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
                <BalanceSheetDatePicker />
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
            <BookkeepingStatusReportRow currentDate={effectiveDate} onViewBookkeepingTasks={onViewBookkeepingTasks} />
          </Header>
        )}
        notification={<BookkeepingStatusPanelNotification onClick={onViewBookkeepingTasks} />}
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
