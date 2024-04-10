import React from 'react'
import { useLinkedAccounts } from '../../hooks/useLinkedAccounts'
import PlusIcon from '../../icons/PlusIcon'
import { Container, Header } from '../Container'
import { DataState, DataStateStatus } from '../DataState'
import { LinkedAccountOptions } from '../LinkedAccountOptions'
import { LinkedAccountThumb } from '../LinkedAccountThumb'
import { Loader } from '../Loader'
import { Heading, HeadingSize, Text, TextSize } from '../Typography'
import classNames from 'classnames'

const COMPONENT_NAME = 'linked-accounts'

export const LinkedAccounts = ({ asWidget }: { asWidget?: boolean }) => {
  const {
    data,
    isLoading,
    error,
    isValidating,
    refetch,
    addAccount,
    unlinkAccount,
    relinkAccount,
  } = useLinkedAccounts()

  const linkedAccountOptionsConfig = [
    { name: 'Unlink', action: unlinkAccount },
    { name: 'Relink', action: relinkAccount },
  ]

  const linkedAccountsNewAccountClassName = classNames(
    'Layer__linked-accounts__new-account',
    asWidget && '--as-widget',
  )

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
            <LinkedAccountOptions
              key={`linked-acc-${index}`}
              config={linkedAccountOptionsConfig}
            >
              <LinkedAccountThumb account={account} asWidget={asWidget} />
            </LinkedAccountOptions>
          ))}
          <div
            role='button'
            tabIndex={0}
            aria-label='new-account'
            onClick={() => addAccount()}
            className={linkedAccountsNewAccountClassName}
          >
            <div className='Layer__linked-accounts__new-account-label'>
              <PlusIcon size={16} />
              <Text as='span' size={'sm' as TextSize}>
                New Account
              </Text>
            </div>
          </div>
        </div>
      ) : null}
    </Container>
  )
}
