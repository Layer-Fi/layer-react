import React from 'react'
import { useLinkedAccounts } from '../../hooks/useLinkedAccounts'
import { Container, Header } from '../Container'
import { DataState, DataStateStatus } from '../DataState'
import { Loader } from '../Loader'
import { Heading, HeadingSize } from '../Typography'
import { LinkedAccountThumb } from './LinkedAccountThumb'

const COMPONENT_NAME = 'linked-accounts'

export const LinkedAccounts = ({ asWidget }: { asWidget?: boolean }) => {
  const { data, isLoading, error, isValidating, refetch } = useLinkedAccounts()

  return (
    <Container name={COMPONENT_NAME}>
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
          onRefresh={() => refetch()}
          isLoading={isValidating}
        />
      ) : null}
      {!error && !isLoading ? (
        <div className='Layer__linked-accounts__list'>
          {data?.map((account, index) => (
            <LinkedAccountThumb
              account={account}
              asWidget={index === 2 ? true : asWidget}
              key={`linked-acc-${index}`}
            />
          ))}
        </div>
      ) : null}
    </Container>
  )
}
