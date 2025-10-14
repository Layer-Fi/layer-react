import { useCallback } from 'react'
import { BaseDetailView } from '../BaseDetailView/BaseDetailView'
import { Heading } from '../ui/Typography/Heading'
import { HStack } from '../ui/Stack/Stack'
import { useBankTransactionsNavigation } from '../../providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'
import BackArrow from '../../icons/BackArrow'
import { CategorizationRulesTable } from './CategorizationRulesTable/CategorizationRulesTable'

export const CategorizationRulesDrawer = () => {
  const { toBankTransactionsTable } = useBankTransactionsNavigation()

  const Header = useCallback(() => {
    return (
      <CategorizationRulesDrawerHeader />
    )
  }, [])

  return (
    <>
      <BaseDetailView
        slots={{ Header, BackIcon: BackArrow }}
        name='CategorizationRulesDrawer'
        onGoBack={toBankTransactionsTable}
      >
        <CategorizationRulesTable />
      </BaseDetailView>
    </>
  )
}

const CategorizationRulesDrawerHeader = () => {
  return (
    <HStack justify='space-between' align='center' fluid pie='md'>
      <Heading size='sm'>Categorization Rules</Heading>
    </HStack>
  )
}
