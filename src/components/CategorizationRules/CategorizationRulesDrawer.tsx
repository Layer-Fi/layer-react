import { Heading } from '@ui/Typography/Heading'
import { useCallback } from 'react'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'
import { HStack } from '@ui/Stack/Stack'
import { useBankTransactionsNavigation } from '@providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'
import BackArrow from '@icons/BackArrow'
import { CategorizationRulesTable } from '@components/CategorizationRules/CategorizationRulesTable/CategorizationRulesTable'

const CategorizationRulesDrawerHeader = () => {
  return (
    <HStack justify='space-between' align='center' fluid pie='md'>
      <Heading size='sm'>Categorization Rules</Heading>
    </HStack>
  )
}

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
