import React, { createContext, useContext } from 'react'
import { useLedgerAccounts } from '../../hooks/useLedgerAccounts'
import DownloadCloud from '../../icons/DownloadCloud'
import { AccountsReceivable } from '../AccountsReceivable'
import { Button, ButtonVariant } from '../Button'
import { Container, Header } from '../Container'
import { DataState, DataStateStatus } from '../DataState'
import { LedgerAccountsRow } from '../LedgerAccountsRow'
import { LedgerAccountsSidebar } from '../LedgerAccountsSidebar'
import { Loader } from '../Loader'
import { Heading } from '../Typography'

const COMPONENT_NAME = 'ledger-accounts'

export type LedgerAccountsContextType = ReturnType<typeof useLedgerAccounts>
export const LedgerAccountsContext = createContext<LedgerAccountsContextType>({
  data: undefined,
  isLoading: false,
  isValidating: false,
  error: undefined,
  refetch: () => {},
  create: () => {},
  form: undefined,
  addAccount: () => {},
  editAccount: () => {},
  cancelForm: () => {},
  changeFormData: () => {},
  submitForm: () => {},
  showARForAccountId: undefined,
  setShowARForAccountId: () => {},
})

export const LedgerAccounts = () => {
  const contextData = useLedgerAccounts()
  return (
    <LedgerAccountsContext.Provider value={contextData}>
      <LedgerAccountsContent />
    </LedgerAccountsContext.Provider>
  )
}

const LedgerAccountsContent = () => {
  const { data, isLoading, addAccount, error, isValidating, refetch } =
    useContext(LedgerAccountsContext)

  return (
    <Container name={COMPONENT_NAME}>
      <div className={`Layer__${COMPONENT_NAME}__main-panel`}>
        <Header className={`Layer__${COMPONENT_NAME}__header`}>
          <Heading className={`Layer__${COMPONENT_NAME}__title`}>
            Chart of Accounts
          </Heading>
          <div className={`Layer__${COMPONENT_NAME}__actions`}>
            <Button
              variant={ButtonVariant.secondary}
              disabled={isLoading}
              rightIcon={<DownloadCloud size={12} />}
            >
              Download
            </Button>
            <Button onClick={() => addAccount()} disabled={isLoading}>
              Add Account
            </Button>
          </div>
        </Header>

        <table className={`Layer__${COMPONENT_NAME}__table`}>
          <thead>
            <tr className='Layer__table-row--header'>
              <th className='Layer__table-header Layer__coa__name'>Name</th>
              <th className='Layer__table-header Layer__coa__type'>Type</th>
              <th className='Layer__table-header Layer__coa__subtype'>
                Sub-Type
              </th>
              <th className='Layer__table-header Layer__coa__balance'>
                Balance
              </th>
              <th className='Layer__table-header Layer__coa__actions' />
            </tr>
          </thead>

          <tbody>
            {!error &&
              data?.accounts.map(account => (
                <LedgerAccountsRow
                  key={account.id}
                  account={account}
                  depth={0}
                />
              ))}
          </tbody>
        </table>

        {error ? (
          <div className='Layer__table-state-container'>
            <DataState
              status={DataStateStatus.failed}
              title='Something went wrong'
              description='We couldn’t load your data.'
              onRefresh={() => refetch()}
              isLoading={isValidating || isLoading}
            />
          </div>
        ) : null}

        {(!data || isLoading) && !error ? (
          <div className={`Layer__${COMPONENT_NAME}__loader-container`}>
            <Loader />
          </div>
        ) : null}

        {!isLoading && !error && data?.accounts.length === 0 ? (
          <div className='Layer__table-state-container'>
            <DataState
              status={DataStateStatus.info}
              title='Accounts were not found'
              description='New account can be created with "Add Account".'
              onRefresh={() => refetch()}
              isLoading={isValidating}
            />
          </div>
        ) : null}
      </div>
      <LedgerAccountsSidebar />

      <AccountsReceivable />
    </Container>
  )
}
