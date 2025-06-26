import { Fragment, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ChartOfAccountsContext } from '../../contexts/ChartOfAccountsContext'
import { LedgerAccountsContext } from '../../contexts/LedgerAccountsContext'
import { TableProvider } from '../../contexts/TableContext/TableContext'
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
import { HStack } from '../ui/Stack/Stack'
import { List } from 'lucide-react'
import { convertCentsToCurrency } from '../../utils/format'
import { centsToDollars, centsToDollarsWithoutCommas } from '../../models/Money'
import { Span } from '../ui/Typography/Text'
import { DataState, DataStateStatus } from '../DataState/DataState'

const SORTED_STABLE_NAMES = ['ASSETS', 'LIABILITIES', 'EQUITY', 'REVENUE', 'EXPENSES']
const accountMatchesQuery = (account: LedgerAccountBalance, query: string) => {
  return [
    account.name,
    account.account_type.display_name,
    account.account_subtype?.display_name || '',
    centsToDollars(account.balance),
    centsToDollarsWithoutCommas(account.balance),
    convertCentsToCurrency(account.balance) || '']
    .some(field => field.toLowerCase().includes(query))
}

type AugmentedLedgerAccountBalance = LedgerAccountBalance & { isMatching?: true }

const skippedChars = ['$', ',']
const highlightMatch = ({ text, query, isMatching }: { text: string, query: string, isMatching?: boolean }): ReactNode => {
  if (!query || !isMatching) return text

  const normalize = (s: string) => s.replace(/[$,]/g, '').toLowerCase()
  const normalizedText = normalize(text)
  const normalizedQuery = normalize(query)
  const normalizedMatchStartIdx = normalizedText.indexOf(normalizedQuery)
  if (normalizedMatchStartIdx === -1) return text

  // Locate the starting index in the original text that corresponds to the beginning of the normalized match
  let positionInNormalizedText = 0, matchStartIdx = 0
  while (positionInNormalizedText < normalizedMatchStartIdx && matchStartIdx < text.length) {
    if (!skippedChars.includes(text[matchStartIdx])) positionInNormalizedText++
    matchStartIdx++
  }

  // Adjust forward to skip a leading '$' or ',' if it wasn't part of the original query
  if (skippedChars.includes(text[matchStartIdx]) && query[0] !== text[matchStartIdx]) {
    matchStartIdx++
  }

  // Advance through the original text to cover all characters that map to the original query
  let charsMatched = 0, matchEndIdx = matchStartIdx
  while (charsMatched < normalizedQuery.length && matchEndIdx < text.length) {
    if (!skippedChars.includes(text[matchEndIdx])) charsMatched++
    matchEndIdx++
  }

  // Optionally include a trailing '$' or ',' if it was explicitly included in the query
  if (skippedChars.includes(text[matchEndIdx]) && query[query.length - 1] === text[matchEndIdx]) {
    matchEndIdx++
  }

  return (
    <Span ellipsis>
      {text.slice(0, matchStartIdx)}
      <mark className='Layer__mark'>{text.slice(matchStartIdx, matchEndIdx)}</mark>
      {text.slice(matchEndIdx)}
    </Span>
  )
}

export const ChartOfAccountsTable = ({
  view,
  stringOverrides,
  data,
  searchQuery,
  error,
  expandAll,
  templateAccountsEditable = true,
}: {
  view: View
  data: ChartWithBalances
  searchQuery: string
  stringOverrides?: ChartOfAccountsTableStringOverrides
  error?: unknown
  expandAll?: ExpandActionState
  templateAccountsEditable?: boolean
}) => (
  <TableProvider>
    <ChartOfAccountsTableContent
      view={view}
      data={data}
      searchQuery={searchQuery}
      stringOverrides={stringOverrides}
      error={error}
      expandAll={expandAll}
      templateAccountsEditable={templateAccountsEditable}
    />
  </TableProvider>
)

export const ChartOfAccountsTableContent = ({
  stringOverrides,
  data,
  searchQuery,
  error,
  expandAll,
  templateAccountsEditable,
}: {
  view: View
  data: ChartWithBalances
  searchQuery: string
  stringOverrides?: ChartOfAccountsTableStringOverrides
  error?: unknown
  expandAll?: ExpandActionState
  templateAccountsEditable: boolean
}) => {
  const { setAccountId } = useContext(LedgerAccountsContext)
  const { editAccount } = useContext(ChartOfAccountsContext)
  const [toggledKeys, setToggledKeys] = useState<Record<string, boolean>>({})

  const sortedAccounts = useMemo(() => {
    return data.accounts.sort((a, b) => {
      const indexA = SORTED_STABLE_NAMES.indexOf(a.stable_name)
      const indexB = SORTED_STABLE_NAMES.indexOf(b.stable_name)

      if (indexA === -1 && indexB === -1) return 0
      if (indexA === -1) return 1
      if (indexB === -1) return -1

      return indexA - indexB
    })
  }, [data.accounts])

  const allRowKeys = useMemo(() => {
    const keys: string[] = []

    const collect = (accounts: LedgerAccountBalance[]) => {
      for (const account of accounts) {
        const key = `coa-row-${account.id}`
        if (account.sub_accounts.length > 0) {
          keys.push(key)
          collect(account.sub_accounts)
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
  }, [expandAll])

  // Clear all manually toggled expanded/collapsed rows when the search query changes
  useEffect(() => {
    setToggledKeys({})
  }, [searchQuery])

  const searchQueryLowerCase = searchQuery.toLowerCase()
  const filterAccounts = useCallback((accounts: LedgerAccountBalance[]): AugmentedLedgerAccountBalance[] => {
    return accounts.flatMap((account) => {
      const isMatching = accountMatchesQuery(account, searchQueryLowerCase)
      const matchingChildren = filterAccounts(account.sub_accounts)

      if (matchingChildren.length > 0) {
        return [{ ...account, sub_accounts: matchingChildren, isMatching: true }]
      }

      if (isMatching) {
        return [{ ...account, isMatching: true }]
      }

      return []
    })
  }, [searchQueryLowerCase])

  const filteredAccounts = useMemo(() => {
    if (!searchQuery) return sortedAccounts

    return filterAccounts(sortedAccounts)
  }, [sortedAccounts, filterAccounts, searchQuery])

  const renderChartOfAccountsDesktopRow = ({ account, index, depth, searchQuery }: {
    account: AugmentedLedgerAccountBalance
    index: number
    depth: number
    searchQuery: string
  }) => {
    const rowKey = `coa-row-${account.id}`
    const hasSubAccounts = !!account.sub_accounts && account.sub_accounts.length > 0

    const manuallyToggled = toggledKeys[rowKey]

    const isExpanded =
      !hasSubAccounts
      || manuallyToggled === true
      || (manuallyToggled !== false && (account.isMatching || depth === 0))

    const isNonEditable = !templateAccountsEditable && !!account.stable_name

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
            <HStack {...(!hasSubAccounts && { pis: 'lg' })} overflow='hidden'>
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
                text: account.account_type?.display_name || '',
                query: searchQuery,
                isMatching: account.isMatching,
              })}
          </TableCell>
          <TableCell>
            {depth != 0
              && highlightMatch({
                text: account.account_subtype?.display_name || '',
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
    <Table componentName='chart-of-accounts'>
      <colgroup>
        <col className='Layer__chart-of-accounts--name' />
        <col className='Layer__chart-of-accounts--type' />
        <col className='Layer__chart-of-accounts--subtype' />
        <col className='Layer__chart-of-accounts--balance' />
        <col className='Layer__chart-of-accounts--actions' />
      </colgroup>
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
  )
}
