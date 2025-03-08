import { useContext } from 'react'
import { LinkedAccountsContext } from '../../contexts/LinkedAccountsContext'
import { LinkedAccountsProvider } from '../../providers/LinkedAccountsProvider'
import { Container, Header } from '../Container'
import { DataState, DataStateStatus } from '../DataState'
import { Loader } from '../Loader'
import { Heading, HeadingSize } from '../Typography'
import { LinkedAccountsContent } from './LinkedAccountsContent'
import { OpeningBalanceModal } from './OpeningBalanceModal/OpeningBalanceModal'
import { AccountConfirmationStoreProvider } from '../../providers/AccountConfirmationStoreProvider'

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
  elevated,
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
            onRefresh={() => refetchAccounts()}
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
