import React, { RefObject, useContext } from 'react'
import DownloadCloud from '../../icons/DownloadCloud'
import { Button, ButtonVariant } from '../Button'
import { ChartOfAccountsContext, View } from '../ChartOfAccounts'
import { ChartOfAccountsRow } from '../ChartOfAccountsRow'
import { ChartOfAccountsSidebar } from '../ChartOfAccountsSidebar'
import { Header } from '../Container'
import { DataState, DataStateStatus } from '../DataState'
import { Loader } from '../Loader'
import { Panel } from '../Panel'
import { Heading } from '../Typography'

const COMPONENT_NAME = 'chart-of-accounts'

export const ChartOfAccountsTable = ({
  view,
  containerRef,
}: {
  view: View
  containerRef: RefObject<HTMLDivElement>
}) => {
  const { data, isLoading, addAccount, error, isValidating, refetch, form } =
    useContext(ChartOfAccountsContext)

  let cumulativeIndex = 0
  const accountsLength = data?.accounts.length ?? 0

  return (
    <Panel
      sidebar={<ChartOfAccountsSidebar parentRef={containerRef} />}
      sidebarIsOpen={Boolean(form)}
      parentRef={containerRef}
    >
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

      <table className='Layer__chart-of-accounts__table'>
        <thead>
          <tr className='Layer__table-row--header'>
            <th className='Layer__table-header Layer__coa__name'>Name</th>
            <th className='Layer__table-header Layer__coa__type'>Type</th>
            <th className='Layer__table-header Layer__coa__subtype Layer__mobile--hidden'>
              Sub-Type
            </th>
            <th className='Layer__table-header Layer__coa__balance'>Balance</th>
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
    </Panel>
  )
}
