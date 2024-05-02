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

export interface LinkedAccountsProps {
  asWidget?: boolean
  elevated?: boolean
}

export const LinkedAccounts = ({ asWidget, elevated }: LinkedAccountsProps) => {
  const {
    data,
    isLoading,
    error,
    isValidating,
    refetchAccounts,
    addConnection,
    unlinkAccount,
    renewLinkAccount,
  } = useLinkedAccounts()

  const linkedAccountOptionsConfig = [
    { name: 'Renew link', action: renewLinkAccount },
    { name: 'Unlink', action: unlinkAccount },
  ]

  const linkedAccountsNewAccountClassName = classNames(
    'Layer__linked-accounts__new-account',
    asWidget && '--as-widget',
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
        <div className='Layer__linked-accounts__list'>
          {data?.map((account, index) => (
            <LinkedAccountOptions
              key={`linked-acc-${index}`}
              config={linkedAccountOptionsConfig}
              accountId={account.external_account_external_id}
              plaidItemId={'TODO' /*account.connection_id*/}
            >
              <LinkedAccountThumb account={account} asWidget={asWidget} />
            </LinkedAccountOptions>
          ))}
          <div
            role='button'
            tabIndex={0}
            aria-label='new-account'
            onClick={() => addConnection('PLAID')}
            className={linkedAccountsNewAccountClassName}
          >
            <div className='Layer__linked-accounts__new-account-label'>
              <PlusIcon size={15} />
              <Text as='span' size={'sm' as TextSize}>
                Add Account
              </Text>
            </div>
          </div>
        </div>
      ) : null}
    </Container>
  )
}
