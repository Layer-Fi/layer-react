import React, { createContext, useContext } from 'react'
import { useLedgerAccounts } from '../../hooks/useLedgerAccounts'
import DownloadCloud from '../../icons/DownloadCloud'
import { Button, ButtonVariant } from '../Button'
import { Container, Header } from '../Container'
import { LedgerAccountsRow } from '../LedgerAccountsRow'
import { LedgerAccountsSidebar } from '../LedgerAccountsSidebar'
import { Loader } from '../Loader'
import { Heading } from '../Typography'

const COMPONENT_NAME = 'ledger-accounts'

export type LedgerAccountsContextType = ReturnType<typeof useLedgerAccounts>
export const LedgerAccountsContext = createContext<LedgerAccountsContextType>({
  data: undefined,
  isLoading: false,
  error: undefined,
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
  const { data, isLoading, addAccount } = useContext(LedgerAccountsContext)

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

        <div className={`Layer__${COMPONENT_NAME}__table`}>
          <div className='Layer__alt-table-row Layer__alt-table-row--header'>
            <div className='Layer__alt-table__head-cell Layer__coa__name'>
              Name
            </div>
            <div className='Layer__alt-table__head-cell Layer__coa__type'>
              Type
            </div>
            <div className='Layer__alt-table__head-cell Layer__coa__subtype'>
              Sub-Type
            </div>
            <div className='Layer__alt-table__head-cell Layer__coa__balance'>
              Balance
            </div>
            <div className='Layer__alt-table__head-cell Layer__coa__actions'></div>
          </div>

          {!data || isLoading ? (
            <div className={`Layer__${COMPONENT_NAME}__loader-container`}>
              <Loader />
            </div>
          ) : null}

          {data?.accounts.map((account, idx) => (
            <LedgerAccountsRow key={account.id} account={account} depth={0} />
          ))}
        </div>
      </div>
      <LedgerAccountsSidebar />
    </Container>
  )
}
