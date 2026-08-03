import { useEffect } from 'react'

import { useBankAccountFilterActions } from '@providers/BankAccountsFilterStore/BankAccountsFilterStoreProvider'
import { BankTransactionsRoute, useBankTransactionsRouteState } from '@providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'
import { useCountSelectedIds } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { ResponsiveBankTransactionsView, type ResponsiveBankTransactionsViewProps } from '@features/bankTransactions/ResponsiveBankTransactionsView/ResponsiveBankTransactionsView'
import { ResponsiveCategorizationRulesView } from '@features/categorization/ResponsiveCategorizationRulesView/ResponsiveCategorizationRulesView'

const LockBankAccountFilter = () => {
  const { setLocked } = useBankAccountFilterActions()

  useEffect(() => {
    setLocked(true)
    return () => setLocked(false)
  }, [setLocked])

  return null
}

export const BankTransactionsRouter = (props: ResponsiveBankTransactionsViewProps) => {
  const routeState = useBankTransactionsRouteState()
  const { count } = useCountSelectedIds()

  return (
    <>
      {count > 0 && <LockBankAccountFilter />}
      {routeState.route === BankTransactionsRoute.BankTransactionsTable
        ? <ResponsiveBankTransactionsView {...props} />
        : <ResponsiveCategorizationRulesView />}
    </>
  )
}
