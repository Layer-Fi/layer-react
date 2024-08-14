import React, { RefObject, useContext, useState } from 'react'
import { ChartOfAccountsContext } from '../../contexts/ChartOfAccountsContext'
import { Button, ButtonVariant } from '../Button'
import { View } from '../ChartOfAccounts/ChartOfAccounts'
import { ChartOfAccountsDatePicker } from '../ChartOfAccountsDatePicker'
import { ChartOfAccountsFormStringOverrides } from '../ChartOfAccountsForm/ChartOfAccountsForm'
import { ChartOfAccountsRow } from '../ChartOfAccountsRow'
import { ChartOfAccountsSidebar } from '../ChartOfAccountsSidebar'
import { Header } from '../Container'
import { HeaderLayout } from '../Container/Header'
import { DataState, DataStateStatus } from '../DataState'
import { Loader } from '../Loader'
import { Panel } from '../Panel'
import { Table, TableBody } from '../Table'
import { TableCell } from '../TableCell'
import { TableHead } from '../TableHead'
import { TableRow } from '../TableRow'
import { Heading, HeadingSize } from '../Typography'

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

export const ChartOfAccountsTable = ({
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

  let cumulativeIndex = 0
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

      <Table>
        <TableHead>
          <TableRow isHeadRow rowKey='charts-of-accounts-head-row'>
            <TableCell isHeaderCell>
              {stringOverrides?.nameColumnHeader || 'Name'}
            </TableCell>
            <TableCell isHeaderCell>
              {stringOverrides?.typeColumnHeader || 'Type'}
            </TableCell>
            <TableCell isHeaderCell>
              {stringOverrides?.subtypeColumnHeader || 'Sub-Type'}
            </TableCell>
            <TableCell isHeaderCell>
              {stringOverrides?.balanceColumnHeader || 'Balance'}
            </TableCell>
            <TableCell isHeaderCell />
          </TableRow>
        </TableHead>
        <TableBody>
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
                  expandAll={expandAll}
                />
              )
            })}
        </TableBody>
      </Table>

      <table className='Layer__chart-of-accounts__table'>
        <thead>
          <tr className='Layer__table-row--header'>
            <th className='Layer__table-header Layer__coa__name'>
              {stringOverrides?.nameColumnHeader || 'Name'}
            </th>
            <th className='Layer__table-header Layer__coa__type'>
              {stringOverrides?.typeColumnHeader || 'Type'}
            </th>
            <th className='Layer__table-header Layer__coa__subtype Layer__mobile--hidden'>
              {stringOverrides?.subtypeColumnHeader || 'Sub-Type'}
            </th>
            <th className='Layer__table-header Layer__coa__balance'>
              {stringOverrides?.balanceColumnHeader || 'Balance'}
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
                  expandAll={expandAll}
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
