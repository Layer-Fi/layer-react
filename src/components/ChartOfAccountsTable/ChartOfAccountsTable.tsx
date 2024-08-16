import React, { useContext, useEffect, useState } from 'react'
import { ChartOfAccountsContext } from '../../contexts/ChartOfAccountsContext'
import { LedgerAccountsContext } from '../../contexts/LedgerAccountsContext'
import { TableProvider } from '../../contexts/TableContext'
import { useTableExpandRow } from '../../hooks/useTableExpandRow'
import Edit2 from '../../icons/Edit2'
import {
  ChartWithBalances,
  LedgerAccountBalance,
} from '../../types/chart_of_accounts'
import { Button, ButtonVariant } from '../Button'
import { View } from '../ChartOfAccounts/ChartOfAccounts'
import { ChartOfAccountsRow } from '../ChartOfAccountsRow'
import { Table, TableBody } from '../Table'
import { TableCell } from '../TableCell'
import { TableHead } from '../TableHead'
import { TableRow } from '../TableRow'
import {
  ChartOfAccountsTableStringOverrides,
  ExpandActionState,
} from './ChartOfAccountsTableWithPanel'

export const ChartOfAccountsTable = ({
  view,
  stringOverrides,
  data,
  error,
  expandAll,
  cumulativeIndex,
  accountsLength,
}: {
  view: View
  data: ChartWithBalances
  stringOverrides?: ChartOfAccountsTableStringOverrides
  error?: any
  expandAll?: ExpandActionState
  cumulativeIndex: number
  accountsLength: number
}) => (
  <TableProvider>
    <ChartOfAccountsTableContent
      view={view}
      data={data}
      stringOverrides={stringOverrides}
      error={error}
      expandAll={expandAll}
      cumulativeIndex={cumulativeIndex}
      accountsLength={accountsLength}
    />
  </TableProvider>
)

export const ChartOfAccountsTableContent = ({
  view,
  stringOverrides,
  data,
  error,
  expandAll,
  cumulativeIndex,
  accountsLength,
}: {
  view: View
  data: ChartWithBalances
  stringOverrides?: ChartOfAccountsTableStringOverrides
  error?: any
  expandAll?: ExpandActionState
  cumulativeIndex: number
  accountsLength: number
}) => {
  const { setAccountId } = useContext(LedgerAccountsContext)
  const { editAccount } = useContext(ChartOfAccountsContext)
  const { isOpen, setIsOpen } = useTableExpandRow()
  const [accountsRowKeys, setAccountsRowKeys] = useState<string[]>([])

  useEffect(() => {
    if (expandAll === 'expanded') {
      setIsOpen(accountsRowKeys)
    } else if (expandAll === 'collapsed') {
      setIsOpen([])
    }
  }, [expandAll])

  useEffect(() => {
    const defaultExpanded = data.accounts.map(
      account => 'coa-row-' + account.id,
    )
    setIsOpen(defaultExpanded)

    const searchRowsToExpand = (
      accounts: LedgerAccountBalance[],
      rowKey: string,
    ) => {
      accounts.map(account => {
        if (account.sub_accounts.length > 0) {
          setAccountsRowKeys(prev => [...prev, `${rowKey}-${account.id}`])
          searchRowsToExpand(account.sub_accounts, `${rowKey}-${account.id}`)
        }
      })
    }

    searchRowsToExpand(data.accounts, 'coa-row')
  }, [])

  const renderChartOfAccountsDesktopRow = (
    account: LedgerAccountBalance,
    index: number,
    rowKey: string,
    depth: number,
  ) => {
    const expandable = !!account.sub_accounts && account.sub_accounts.length > 0
    const expanded = expandable ? isOpen(rowKey) : true

    return (
      <React.Fragment key={rowKey + '-' + index}>
        <TableRow
          rowKey={rowKey + '-' + index}
          expandable={expandable}
          isExpanded={expanded}
          onClick={e => {
            e.stopPropagation()
            setAccountId(account.id)
          }}
          depth={depth}
        >
          <TableCell
            withExpandIcon={expandable}
            onClick={e => {
              e.stopPropagation()
              expandable && setIsOpen(rowKey)
            }}
          >
            {account.name}
          </TableCell>
          <TableCell>{account.account_type?.display_name}</TableCell>
          <TableCell>{account.account_subtype?.display_name}</TableCell>
          <TableCell isCurrency>{account.balance}</TableCell>
          <TableCell>
            <span className='Layer__coa__actions'>
              <Button
                variant={ButtonVariant.secondary}
                rightIcon={<Edit2 size={12} />}
                iconOnly={true}
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  editAccount(account.id)
                }}
              >
                Edit
              </Button>
            </span>
          </TableCell>
        </TableRow>
        {expandable &&
          expanded &&
          account.sub_accounts.map((subItem, subIdx) => {
            const subRowKey = `${rowKey}-${subItem.id}`
            return renderChartOfAccountsDesktopRow(
              subItem,
              subIdx,
              subRowKey,
              depth + 1,
            )
          })}
      </React.Fragment>
    )
  }

  return (
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
          data.accounts.map((account, idx) =>
            renderChartOfAccountsDesktopRow(
              account,
              idx,
              `coa-row-${account.id}`,
              0,
            ),
          )}
      </TableBody>
    </Table>
  )
}
