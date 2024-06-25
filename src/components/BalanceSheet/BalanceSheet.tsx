import React, { useState } from 'react'
import { BalanceSheetContext } from '../../contexts/BalanceSheetContext'
import { TableExpandProvider } from '../../contexts/TableExpandContext'
import { useBalanceSheet } from '../../hooks/useBalanceSheet'
<<<<<<< HEAD
import { BalanceSheetHeader } from '../BalanceSheetHeader'
import { BalanceSheetTable } from '../BalanceSheetTable'
import { Container } from '../Container'
import { Loader } from '../Loader'
import { BALANCE_SHEET_ROWS } from './constants'
import { startOfDay } from 'date-fns'
=======
import { BalanceSheetDatePicker } from '../BalanceSheetDatePicker'
import { BalanceSheetRow } from '../BalanceSheetRow'
import { SkeletonBalanceSheetRow } from '../SkeletonBalanceSheetRow'
import { format, parseISO } from 'date-fns'
>>>>>>> origin/main

export interface BalanceSheetProps {
  withTitle?: boolean
  effectiveDate?: Date
  withExpandAllButton?: boolean
}

const COMPONENT_NAME = 'balance-sheet'

export const BalanceSheet = (props: BalanceSheetProps) => {
  const balanceSheetContextData = useBalanceSheet(props.effectiveDate)
  return (
    <BalanceSheetContext.Provider value={balanceSheetContextData}>
      <BalanceSheetContent {...props} />
    </BalanceSheetContext.Provider>
  )
}

export const BalanceSheetContent = ({
  withExpandAllButton = true,
  withTitle = true,
}: BalanceSheetProps) => {
  const [effectiveDate, setEffectiveDate] = useState(startOfDay(new Date()))
  const { data, isLoading } = useBalanceSheet(effectiveDate)

  return (
    <TableExpandProvider>
      <Container name='balance-sheet'>
        <BalanceSheetHeader
          effectiveDate={effectiveDate}
          setEffectiveDate={setEffectiveDate}
          withExpandAllButton={withExpandAllButton}
          withTitle={withTitle}
        />
        {!data || isLoading ? (
          <div className={`Layer__${COMPONENT_NAME}__loader-container`}>
            <Loader />
          </div>
        ) : (
          <>
            <BalanceSheetTable data={data} config={BALANCE_SHEET_ROWS} />
          </>
        )}
      </Container>
    </TableExpandProvider>
  )
}
