import React, { createContext, useContext, useEffect, useState } from 'react'
import { useChartOfAccounts } from '../../hooks/useChartOfAccounts'
import { useElementSize } from '../../hooks/useElementSize'
import DownloadCloud from '../../icons/DownloadCloud'
import { Button, ButtonVariant } from '../Button'
import { ChartOfAccountsRow } from '../ChartOfAccountsRow'
import { ChartOfAccountsSidebar } from '../ChartOfAccountsSidebar'
import { Container, Header } from '../Container'
import { DataState, DataStateStatus } from '../DataState'
import { LedgerAccount } from '../LedgerAccount'
import { Loader } from '../Loader'
import { Heading } from '../Typography'

const COMPONENT_NAME = 'chart-of-accounts'
const MOBILE_BREAKPOINT = 760

export type View = 'mobile' | 'desktop'

export type ChartOfAccountsContextType = ReturnType<typeof useChartOfAccounts>
export const ChartOfAccountsContext = createContext<ChartOfAccountsContextType>(
  {
    data: undefined,
    isLoading: false,
    isValidating: false,
    error: undefined,
    refetch: () => {},
    create: () => {},
    form: undefined,
    sendingForm: false,
    apiError: undefined,
    addAccount: () => {},
    editAccount: () => {},
    cancelForm: () => {},
    changeFormData: () => {},
    submitForm: () => {},
    showARForAccountId: undefined,
    setShowARForAccountId: () => {},
  },
)

export const ChartOfAccounts = () => {
  const contextData = useChartOfAccounts()
  return (
    <ChartOfAccountsContext.Provider value={contextData}>
      <ChartOfAccountsContent />
    </ChartOfAccountsContext.Provider>
  )
}

const ChartOfAccountsContent = () => {
  const { data, isLoading, addAccount, error, isValidating, refetch } =
    useContext(ChartOfAccountsContext)

  const [view, setView] = useState<View>('desktop')

  let cumulativeIndex = 0

  const accountsLength = data?.accounts.length ?? 0

  const containerRef = useElementSize<HTMLDivElement>((_a, _b, { width }) => {
    if (width) {
      if (width >= MOBILE_BREAKPOINT && view !== 'desktop') {
        setView('desktop')
      } else if (width < MOBILE_BREAKPOINT && view !== 'mobile') {
        setView('mobile')
      }
    }
  })

  return (
    <Container name={COMPONENT_NAME} ref={containerRef}>
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
              <th className='Layer__table-header Layer__coa__subtype Layer__mobile--hidden'>
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
              data?.accounts.map((account, idx) => {
                const currentCumulativeIndex = cumulativeIndex
                cumulativeIndex =
                  (account.sub_accounts?.length || 0) + cumulativeIndex + 1

                return (
                  <ChartOfAccountsRow
                    key={account.id}
                    account={account}
                    depth={0}
                    index={idx}
                    cumulativeIndex={currentCumulativeIndex}
                    expanded={true}
                    defaultOpen={true}
                    acountsLength={accountsLength}
                    view={view}
                  />
                )
              })}
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
      <ChartOfAccountsSidebar parentRef={containerRef} />

      <LedgerAccount />
    </Container>
  )
}
