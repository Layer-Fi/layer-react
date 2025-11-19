import { useContext } from 'react'

import { AccountConfirmationStoreProvider } from '@providers/AccountConfirmationStoreProvider'
import { LinkedAccountsProvider } from '@providers/LinkedAccountsProvider/LinkedAccountsProvider'
import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'
import { Container } from '@components/Container/Container'
import { Header } from '@components/Container/Header'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { LinkedAccountsContent } from '@components/LinkedAccounts/LinkedAccountsContent'
import { OpeningBalanceModal } from '@components/LinkedAccounts/OpeningBalanceModal/OpeningBalanceModal'
import { Loader } from '@components/Loader/Loader'
import { Heading, HeadingSize } from '@components/Typography/Heading'

const COMPONENT_NAME = 'linked-accounts'

export interface LinkedAccountsProps {
  asWidget?: boolean
  elevated?: boolean
  showLedgerBalance?: boolean
  showUnlinkItem?: boolean
  showBreakConnection?: boolean
  stringOverrides?: {
    title?: string
  }
}

export const LinkedAccounts = (props: LinkedAccountsProps) => {
  return (
    <AccountConfirmationStoreProvider>
      <LinkedAccountsProvider>
        <LinkedAccountsComponent {...props} />
      </LinkedAccountsProvider>
    </AccountConfirmationStoreProvider>
  )
}

export const LinkedAccountsComponent = ({
  asWidget,
  elevated = false,
  showLedgerBalance = true,
  showUnlinkItem = false,
  showBreakConnection = false,
  stringOverrides,
}: LinkedAccountsProps) => {
  const {
    isLoading,
    error,
    isValidating,
    refetchAccounts,
  } = useContext(LinkedAccountsContext)

  return (
    <Container name={COMPONENT_NAME} elevated={elevated}>
      <Header className='Layer__linked-accounts__header'>
        <Heading
          className='Layer__linked-accounts__title'
          size={HeadingSize.secondary}
        >
          {stringOverrides?.title || 'Linked Accounts'}
        </Heading>
      </Header>

      {isLoading && (
        <div className='Layer__linked-accounts__loader-container'>
          <Loader />
        </div>
      )}
      {error && !isLoading
        ? (
          <DataState
            status={DataStateStatus.failed}
            title='Something went wrong'
            description='We couldn’t load your data.'
            onRefresh={() => void refetchAccounts()}
            isLoading={isValidating}
          />
        )
        : null}
      {!error && !isLoading
        ? (
          <LinkedAccountsContent
            asWidget={asWidget}
            showLedgerBalance={showLedgerBalance}
            showUnlinkItem={showUnlinkItem}
            showBreakConnection={showBreakConnection}
          />
        )
        : null}
      <OpeningBalanceModal />
    </Container>
  )
}
