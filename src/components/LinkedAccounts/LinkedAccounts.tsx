import React, { useContext } from 'react'
import { LinkedAccountsContext } from '../../contexts/LinkedAccountsContext'
import { LinkedAccountsProvider } from '../../providers/LinkedAccountsProvider'
import { Container, Header } from '../Container'
import { DataState, DataStateStatus } from '../DataState'
import { Loader } from '../Loader'
import { Heading, HeadingSize } from '../Typography'
import { LinkedAccountsContent } from './LinkedAccountsContent'

const COMPONENT_NAME = 'linked-accounts'

export interface LinkedAccountsProps {
  asWidget?: boolean
  elevated?: boolean
}

export const LinkedAccounts = (props: LinkedAccountsProps) => {
  return (
    <LinkedAccountsProvider>
      <LinkedAccountsComponent {...props} />
    </LinkedAccountsProvider>
  )
}

export const LinkedAccountsComponent = ({
  asWidget,
  elevated,
}: LinkedAccountsProps) => {
  const { isLoading, error, isValidating, refetchAccounts } = useContext(
    LinkedAccountsContext,
  )

  return (
    <Container name={COMPONENT_NAME} elevated={elevated}>
      <Header className='Layer__linked-accounts__header'>
        <Heading
          className='Layer__linked-accounts__title'
          size={HeadingSize.secondary}
        >
          Linked Accounts
        </Heading>
      </Header>

      {isLoading && (
        <div className='Layer__linked-accounts__loader-container'>
          <Loader />
        </div>
      )}
      {error && !isLoading ? (
        <DataState
          status={DataStateStatus.failed}
          title='Something went wrong'
          description='We couldn’t load your data.'
          onRefresh={() => refetchAccounts()}
          isLoading={isValidating}
        />
      ) : null}
      {!error && !isLoading ? (
        <LinkedAccountsContent asWidget={asWidget} />
      ) : null}
    </Container>
  )
}
