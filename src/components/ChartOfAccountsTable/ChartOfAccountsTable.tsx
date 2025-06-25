import { Fragment, useContext, useEffect, useState } from 'react'
import { ChartOfAccountsContext } from '../../contexts/ChartOfAccountsContext'
import { LedgerAccountsContext } from '../../contexts/LedgerAccountsContext'
import { TableProvider } from '../../contexts/TableContext'
import { useTableExpandRow } from '../../hooks/useTableExpandRow'
import Edit2 from '../../icons/Edit2'
import {
  ChartWithBalances,
  LedgerAccountBalance,
} from '../../types/chart_of_accounts'
import { View } from '../../types/general'
import { Button, ButtonVariant } from '../Button'
import { Button as UIButton } from '../ui/Button/Button'
import { Table, TableBody } from '../Table'
import { TableCell } from '../TableCell'
import { TableHead } from '../TableHead'
import { TableRow } from '../TableRow'
import { TableCellAlign } from '../../types/table'
import {
  ChartOfAccountsTableStringOverrides,
  ExpandActionState,
} from './ChartOfAccountsTableWithPanel'
import { HStack, Spacer } from '../ui/Stack/Stack'
import { List } from 'lucide-react'

export const ChartOfAccountsTable = ({
  view,
  stringOverrides,
  data,
  error,
  expandAll,
  cumulativeIndex,
  accountsLength,
  templateAccountsEditable = true,
}: {
  view: View
  data: ChartWithBalances
  stringOverrides?: ChartOfAccountsTableStringOverrides
  error?: unknown
  expandAll?: ExpandActionState
  cumulativeIndex: number
  accountsLength: number
  templateAccountsEditable?: boolean
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
      templateAccountsEditable={templateAccountsEditable}
    />
  </TableProvider>
)

export const ChartOfAccountsTableContent = ({
  stringOverrides,
  data,
  error,
  expandAll,
  templateAccountsEditable,
}: {
  view: View
  data: ChartWithBalances
  stringOverrides?: ChartOfAccountsTableStringOverrides
  error?: unknown
  expandAll?: ExpandActionState
  cumulativeIndex: number
  accountsLength: number
  templateAccountsEditable: boolean
}) => {
  const { setAccountId } = useContext(LedgerAccountsContext)
  const { editAccount } = useContext(ChartOfAccountsContext)
  const { isOpen, setIsOpen } = useTableExpandRow()
  const [accountsRowKeys, setAccountsRowKeys] = useState<string[]>([])

  useEffect(() => {
    if (expandAll === 'expanded') {
      setIsOpen(accountsRowKeys)
    }
    else if (expandAll === 'collapsed') {
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
      accounts.map((account) => {
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
    const hasSubAccounts = !!account.sub_accounts && account.sub_accounts.length > 0
    const isExpanded = hasSubAccounts ? isOpen(rowKey) : true
    const isNonEditable = !templateAccountsEditable && !!account.stable_name

    const onClickRow = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (hasSubAccounts) setIsOpen(rowKey)
    }

    const onClickAccountName = (e: React.MouseEvent) => {
      e.stopPropagation()
      setAccountId(account.id)
    }

    const onClickEdit = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      editAccount(account.id)
    }

    const onClickView = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setAccountId(account.id)
    }

    return (
      <Fragment key={rowKey + '-' + index}>
        <TableRow
          rowKey={rowKey + '-' + index}
          expandable={hasSubAccounts}
          isExpanded={isExpanded}
          onClick={onClickRow}
          depth={depth}
          variant={depth === 0 ? 'expandable' : 'default'}
        >
          <TableCell
            withExpandIcon={hasSubAccounts}
          >
            <HStack gap='lg'>
              {!hasSubAccounts && <Spacer />}
              <UIButton variant='text' onClick={onClickAccountName}>{account.name}</UIButton>
            </HStack>
          </TableCell>
          <TableCell>{depth != 0 && account.account_type?.display_name}</TableCell>
          <TableCell>{depth != 0 && account.account_subtype?.display_name}</TableCell>
          <TableCell isCurrency>{account.balance}</TableCell>
          <TableCell align={TableCellAlign.RIGHT}>
            <HStack className='Layer__coa__actions' gap='xs'>
              <Button
                variant={ButtonVariant.secondary}
                rightIcon={<Edit2 size={14} />}
                iconOnly
                disabled={isNonEditable}
                onClick={onClickEdit}
                tooltip={isNonEditable ? 'This account cannot be modified' : undefined}
              >
                Edit
              </Button>
              <Button
                variant={ButtonVariant.secondary}
                rightIcon={<List size={14} />}
                iconOnly
                onClick={onClickView}
              >
                View
              </Button>
            </HStack>
          </TableCell>
        </TableRow>
        {hasSubAccounts
          && isExpanded
          && account.sub_accounts.map((subItem, subIdx) => {
            const subRowKey = `${rowKey}-${subItem.id}`
            return renderChartOfAccountsDesktopRow(
              subItem,
              subIdx,
              subRowKey,
              depth + 1,
            )
          })}
      </Fragment>
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
        {!error
          && data.accounts.map((account, idx) =>
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
