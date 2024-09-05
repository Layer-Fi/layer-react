import React, { RefObject, useContext, useState } from 'react'
import { ChartOfAccountsContext } from '../../contexts/ChartOfAccountsContext'
import { Button, ButtonVariant } from '../Button'
import { View } from '../ChartOfAccounts/ChartOfAccounts'
import { ChartOfAccountsDatePicker } from '../ChartOfAccountsDatePicker'
import { ChartOfAccountsFormStringOverrides } from '../ChartOfAccountsForm/ChartOfAccountsForm'
import { ChartOfAccountsSidebar } from '../ChartOfAccountsSidebar'
import { Header } from '../Container'
import { HeaderLayout } from '../Container/Header'
import { DataState, DataStateStatus } from '../DataState'
import { Loader } from '../Loader'
import { Panel } from '../Panel'
import { Heading, HeadingSize } from '../Typography'
import { ChartOfAccountsTable } from './ChartOfAccountsTable'

const COMPONENT_NAME = 'chart-of-accounts'
export type ExpandActionState = undefined | 'expanded' | 'collapsed'

export interface ChartOfAccountsTableStringOverrides {
  headerText?: string
  addAccountButtonText?: string
  nameColumnHeader?: string
  typeColumnHeader?: string
  balanceColumnHeader?: string
  subtypeColumnHeader?: string
  chartOfAccountsForm?: ChartOfAccountsFormStringOverrides
}

export const ChartOfAccountsTableWithPanel = ({
  view,
  containerRef,
  asWidget = false,
  withDateControl = false,
  withExpandAllButton = false,
  stringOverrides,
}: {
  view: View
  containerRef: RefObject<HTMLDivElement>
  asWidget?: boolean
  withDateControl?: boolean
  withExpandAllButton?: boolean
  stringOverrides?: ChartOfAccountsTableStringOverrides
}) => {
  const { data, isLoading, addAccount, error, isValidating, refetch, form } =
    useContext(ChartOfAccountsContext)

  const [expandAll, setExpandAll] = useState<ExpandActionState>()

  const cumulativeIndex = 0
  const accountsLength = data?.accounts.length ?? 0

  return (
    <Panel
      sidebar={
        <ChartOfAccountsSidebar
          parentRef={containerRef}
          stringOverrides={stringOverrides?.chartOfAccountsForm}
        />
      }
      sidebarIsOpen={Boolean(form)}
      parentRef={containerRef}
    >
      <Header
        className={`Layer__${COMPONENT_NAME}__header`}
        layout={withDateControl ? HeaderLayout.NEXT_LINE_ACTIONS : undefined}
      >
        <Heading
          className={`Layer__${COMPONENT_NAME}__title`}
          size={asWidget ? HeadingSize.secondary : HeadingSize.primary}
        >
          {stringOverrides?.headerText || 'Chart of Accounts'}
        </Heading>
        <div
          className={`Layer__${COMPONENT_NAME}__actions Layer__header__actions`}
        >
          {withDateControl || withExpandAllButton ? (
            <div className='Layer__header__actions-col'>
              {withDateControl && <ChartOfAccountsDatePicker />}
              {withExpandAllButton && (
                <Button
                  variant={ButtonVariant.secondary}
                  onClick={() =>
                    setExpandAll(
                      !expandAll || expandAll === 'collapsed'
                        ? 'expanded'
                        : 'collapsed',
                    )
                  }
                >
                  {!expandAll || expandAll === 'collapsed'
                    ? 'Expand all rows'
                    : 'Collapse all rows'}
                </Button>
              )}
            </div>
          ) : null}
          <div className='Layer__header__actions-col'>
            <Button onClick={() => addAccount()} disabled={isLoading}>
              {stringOverrides?.addAccountButtonText || 'Add Account'}
            </Button>
          </div>
        </div>
      </Header>

      {data && (
        <ChartOfAccountsTable
          view={view}
          data={data}
          error={error}
          stringOverrides={stringOverrides}
          expandAll={expandAll}
          accountsLength={accountsLength}
          cumulativeIndex={cumulativeIndex}
        />
      )}

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
