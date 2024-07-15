import React, { PropsWithChildren, useEffect, useState } from 'react'
import { BalanceSheetContext } from '../../contexts/BalanceSheetContext'
import { TableProvider } from '../../contexts/TableContext'
import { useBalanceSheet } from '../../hooks/useBalanceSheet'
import { BalanceSheetDatePicker } from '../BalanceSheetDatePicker'
import { BalanceSheetExpandAllButton } from '../BalanceSheetExpandAllButton'
import { BalanceSheetTable } from '../BalanceSheetTable'
import { Container } from '../Container'
import { Loader } from '../Loader'
import { View } from '../View'
import { BALANCE_SHEET_ROWS } from './constants'
import { format, parse, startOfDay } from 'date-fns'

export type BalanceSheetViewProps = PropsWithChildren & {
  withExpandAllButton?: boolean
}

export type BalanceSheetProps = PropsWithChildren & {
  effectiveDate?: Date
}

const COMPONENT_NAME = 'balance-sheet'

export const BalanceSheet = (props: BalanceSheetProps) => {
  const balanceSheetContextData = useBalanceSheet(props.effectiveDate)
  return (
    <BalanceSheetContext.Provider value={balanceSheetContextData}>
      <BalanceSheetView {...props} />
    </BalanceSheetContext.Provider>
  )
}

const BalanceSheetView = ({
  withExpandAllButton = true,
}: BalanceSheetViewProps) => {
  const [effectiveDate, setEffectiveDate] = useState(startOfDay(new Date()))
  const { data, isLoading, refetch } = useBalanceSheet(effectiveDate)

  useEffect(() => {
    // Refetch only if selected effectiveDate and data's effectiveDate are different
    const d1 =
      effectiveDate &&
      format(startOfDay(effectiveDate), "yyyy-MM-dd'T'HH:mm:ssXXX")
    const d2 =
      data?.effective_date &&
      format(
        startOfDay(
          parse(data.effective_date, "yyyy-MM-dd'T'HH:mm:ssXXX", new Date()),
        ),
        "yyyy-MM-dd'T'HH:mm:ssXXX",
      )
    if (d1 && (!d2 || (d2 && d2 !== d1))) {
      refetch()
    }
  }, [effectiveDate])

  return (
    <TableProvider>
      <View
        type='panel'
        headerControls={
          <>
            <BalanceSheetDatePicker
              effectiveDate={effectiveDate}
              setEffectiveDate={setEffectiveDate}
            />
            {withExpandAllButton && <BalanceSheetExpandAllButton />}
          </>
        }
      >
        {!data || isLoading ? (
          <div className={`Layer__${COMPONENT_NAME}__loader-container`}>
            <Loader />
          </div>
        ) : (
          <BalanceSheetTable data={data} config={BALANCE_SHEET_ROWS} />
        )}
      </View>
    </TableProvider>
  )
}
