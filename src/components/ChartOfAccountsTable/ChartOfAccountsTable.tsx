import { TableRow } from '@components/TableRow/TableRow'
import { TableHead } from '@components/TableHead/TableHead'
import { TableCell } from '@components/TableCell/TableCell'
import { TableBody } from '@components/TableBody/TableBody'
import { Table } from '@components/Table/Table'
import { Button as UIButton } from '@ui/Button/Button'
import { Button, ButtonVariant } from '@components/Button/Button'
import { Fragment, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ChartOfAccountsContext } from '@contexts/ChartOfAccountsContext/ChartOfAccountsContext'
import { LedgerAccountsContext } from '@contexts/LedgerAccountsContext/LedgerAccountsContext'
import { TableProvider } from '@contexts/TableContext/TableContext'
import Edit2 from '@icons/Edit2'
import {
  LedgerAccountNodeType,
  type AugmentedLedgerAccountBalance,
} from '@internal-types/chart_of_accounts'
import { View } from '@internal-types/general'
import { TableCellAlign } from '@internal-types/table'
import {
  ChartOfAccountsTableStringOverrides,
  ExpandActionState,
} from '@components/ChartOfAccountsTable/ChartOfAccountsTableWithPanel'
import { HStack } from '@ui/Stack/Stack'
import { List, Trash2 } from 'lucide-react'
import { convertCentsToCurrency } from '@utils/format'
import { Span } from '@ui/Typography/Text'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { filterAccounts, getMatchedTextIndices } from '@components/ChartOfAccountsTable/utils/utils'
import { BaseConfirmationModal } from '@components/BaseConfirmationModal/BaseConfirmationModal'
import { LedgerBalancesSchemaType, NestedLedgerAccountType } from '@schemas/generalLedger/ledgerAccount'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { asMutable } from '@utils/asMutable'

const highlightMatch = ({ text, query, isMatching }: { text: string, query: string, isMatching?: boolean }): ReactNode => {
  const matchedTextIndices = getMatchedTextIndices({ text, query, isMatching })

  if (matchedTextIndices === null) {
    return <Span ellipsis>{text}</Span>
  }

  const { startIdx, endIdx } = matchedTextIndices

  return (
    <Span ellipsis>
      {text.slice(0, startIdx)}
      <mark className='Layer__mark'>{text.slice(startIdx, endIdx)}</mark>
      {text.slice(endIdx)}
    </Span>
  )
}

export const ChartOfAccountsTable = ({
  view,
  stringOverrides,
  data,
  searchQuery,
  expandAll,
  templateAccountsEditable = true,
}: {
  view: View
  data: LedgerBalancesSchemaType
  searchQuery: string
  stringOverrides?: ChartOfAccountsTableStringOverrides
  expandAll?: ExpandActionState
  templateAccountsEditable?: boolean
}) => (
  <TableProvider>
    <ChartOfAccountsTableContent
      view={view}
      data={data}
      searchQuery={searchQuery}
      stringOverrides={stringOverrides}
      expandAll={expandAll}
      templateAccountsEditable={templateAccountsEditable}
    />
  </TableProvider>
)

export const ChartOfAccountsTableContent = ({
  stringOverrides,
  data,
  searchQuery,
  expandAll,
  templateAccountsEditable,
}: {
  view: View
  data: LedgerBalancesSchemaType
  searchQuery: string
  stringOverrides?: ChartOfAccountsTableStringOverrides
  expandAll?: ExpandActionState
  templateAccountsEditable: boolean
}) => {
  const { setSelectedAccount } = useContext(LedgerAccountsContext)
  const { editAccount, deleteAccount, isError } = useContext(ChartOfAccountsContext)
  const [toggledKeys, setToggledKeys] = useState<Record<string, boolean>>({})
  const [accountToDelete, setAccountToDelete] = useState<AugmentedLedgerAccountBalance | null>(null)
  const { accountingConfiguration } = useLayerContext()
  const enableAccountNumbers = !!accountingConfiguration?.enableAccountNumbers

  const allRowKeys = useMemo(() => {
    const keys: string[] = []

    const collect = (accounts: readonly NestedLedgerAccountType[]) => {
      for (const account of accounts) {
        const key = `coa-row-${account.accountId}`
        if (account.subAccounts.length > 0) {
          keys.push(key)
          collect(account.subAccounts)
        }
      }
    }

    collect(data.accounts)
    return keys
  }, [data.accounts])

  useEffect(() => {
    if (expandAll === undefined) return

    // Manually toggle all entries expanded/collasped when the user clicks the Expand/Collapse All button
    setToggledKeys(
      Object.fromEntries(
        allRowKeys.map(key => [key, expandAll === 'expanded']),
      ),
    )
  }, [allRowKeys, expandAll])

  const onConfirmDelete = async () => {
    if (!accountToDelete) return
    await deleteAccount(accountToDelete.accountId)
  }

  const getDeleteButtonTooltip = (account: AugmentedLedgerAccountBalance) => {
    if (account.isDeletable) {
      return undefined
    }
    if (account.subAccounts.length > 0) {
      return 'This account cannot be deleted because it has child accounts'
    }
    if (account.balance !== 0) {
      return 'This account cannot be deleted because it has ledger entries'
    }
    return 'This account cannot be deleted because it is a required account'
  }

  // Clear all manually toggled expanded/collapsed rows when the search query changes
  useEffect(() => {
    setToggledKeys({})
  }, [searchQuery])

  const filteredAccounts = useMemo(() => {
    if (!searchQuery) return data.accounts

    return filterAccounts(asMutable(data.accounts), searchQuery.toLowerCase())
  }, [data.accounts, searchQuery])

  const renderChartOfAccountsDesktopRow = ({ account, index, depth, searchQuery }: {
    account: AugmentedLedgerAccountBalance
    index: number
    depth: number
    searchQuery: string
  }) => {
    const rowKey = `coa-row-${account.accountId}`
    const hasSubAccounts = !!account.subAccounts && account.subAccounts.length > 0

    const nodeType =
      depth === 0
        ? LedgerAccountNodeType.Root
        : hasSubAccounts
          ? LedgerAccountNodeType.Parent
          : LedgerAccountNodeType.Leaf

    const manuallyToggled = toggledKeys[rowKey]

    const isExpanded =
      !hasSubAccounts
      || manuallyToggled === true
      || (manuallyToggled !== false && (account.isMatching || depth === 0))

    const isNonEditable = !templateAccountsEditable && !!account.stableName
    const isDeleteDisabled = !account.isDeletable

    const onClickRow = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!hasSubAccounts) return

      setToggledKeys(prev => ({
        ...prev,
        [rowKey]: !isExpanded,
      }))
    }

    const onClickAccountName = (e: React.MouseEvent) => {
      e.stopPropagation()
      setSelectedAccount({ ...account, nodeType })
    }

    const onClickEdit = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      editAccount(account.accountId)
    }

    const onClickView = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setSelectedAccount({ ...account, nodeType })
    }

    const onClickDelete = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setAccountToDelete(account)
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
          {enableAccountNumbers && (
            <TableCell
              withExpandIcon={hasSubAccounts}
            >
              <HStack {...(!hasSubAccounts && { pis: 'lg' })} overflow='hidden'>
                {enableAccountNumbers
                  && highlightMatch({
                    text: account.accountNumber || '',
                    query: searchQuery,
                    isMatching: account.isMatching,
                  })}
              </HStack>
            </TableCell>
          )}
          <TableCell
            withExpandIcon={hasSubAccounts && !enableAccountNumbers}
          >
            <HStack {...((!hasSubAccounts && !enableAccountNumbers) ? { pis: 'lg' } : {})} overflow='hidden'>
              <UIButton variant='text' ellipsis onClick={onClickAccountName}>
                {
                  highlightMatch({
                    text: account.name,
                    query: searchQuery,
                    isMatching: account.isMatching,
                  })
                }
              </UIButton>
            </HStack>
          </TableCell>
          <TableCell>
            {depth != 0
              && highlightMatch({
                text: account.accountType?.displayName || '',
                query: searchQuery,
                isMatching: account.isMatching,
              })}
          </TableCell>
          <TableCell>
            {depth != 0
              && highlightMatch({
                text: account.accountSubtype?.displayName || '',
                query: searchQuery,
                isMatching: account.isMatching,
              })}
          </TableCell>
          <TableCell>
            {highlightMatch({
              text: convertCentsToCurrency(account.balance) || '',
              query: searchQuery,
              isMatching: account.isMatching,
            })}
          </TableCell>
          <TableCell align={TableCellAlign.RIGHT}>
            <HStack className='Layer__coa__actions' gap='xs'>

              <Button
                variant={ButtonVariant.secondary}
                rightIcon={<List size={14} />}
                iconOnly
                onClick={onClickView}
              >
                View
              </Button>
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
                rightIcon={<Trash2 size={14} />}
                iconOnly
                onClick={onClickDelete}
                disabled={isDeleteDisabled}
                tooltip={getDeleteButtonTooltip(account)}
              >
                Delete
              </Button>
            </HStack>
          </TableCell>
        </TableRow>
        {hasSubAccounts
          && isExpanded
          && account.subAccounts.map((subItem, subIdx) => {
            return renderChartOfAccountsDesktopRow({
              account: subItem,
              index: subIdx,
              depth: depth + 1,
              searchQuery,
            })
          })}
      </Fragment>
    )
  }

  if (filteredAccounts.length === 0) {
    return (
      <div className='Layer__table-state-container'>
        <DataState
          status={DataStateStatus.info}
          title='No accounts found'
          description='No accounts match the current filters. Click "Add Account" to create a new one.'
        />
      </div>
    )
  }

  return (
    <>
      <Table componentName='chart-of-accounts'>
        <colgroup>
          {enableAccountNumbers && <col className='Layer__chart-of-accounts--accountnumber' />}
          <col className='Layer__chart-of-accounts--name' />
          <col className='Layer__chart-of-accounts--type' />
          <col className='Layer__chart-of-accounts--subtype' />
          <col className='Layer__chart-of-accounts--balance' />
          <col className='Layer__chart-of-accounts--actions' />
        </colgroup>
        <TableHead>
          <TableRow isHeadRow rowKey='charts-of-accounts-head-row'>
            {enableAccountNumbers && (
              <TableCell isHeaderCell>
                {stringOverrides?.numberColumnHeader || 'Account Number'}
              </TableCell>
            )}
            <TableCell isHeaderCell>
              {stringOverrides?.nameColumnHeader || 'Account Name'}
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
          {!isError
            && filteredAccounts.map((account, index) =>
              renderChartOfAccountsDesktopRow({
                account,
                index,
                depth: 0,
                searchQuery,
              }),
            )}
        </TableBody>
      </Table>
      <BaseConfirmationModal
        isOpen={accountToDelete !== null}
        onOpenChange={(isOpen: boolean) => {
          if (!isOpen) {
            setAccountToDelete(null)
          }
        }}
        title={`Delete ${accountToDelete?.name}`}
        description='This account will be permanently removed from your Chart of Accounts.'
        onConfirm={onConfirmDelete}
        confirmLabel='Delete Account'
        cancelLabel='Cancel'
      />
    </>

  )
}
