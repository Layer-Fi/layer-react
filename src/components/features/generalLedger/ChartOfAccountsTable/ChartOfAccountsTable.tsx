import { type ReactNode, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react'
import { type Row } from '@tanstack/react-table'
import { List, Pen, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type AugmentedLedgerAccountBalance } from '@internal-types/features/generalLedger/chartOfAccounts'
import { Alignment } from '@internal-types/utility/table'
import { asMutable } from '@utils/shared/array/asMutable'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useDeleteLedgerAccount } from '@api/businesses/[business-id]/ledger/accounts/[account-id]/delete'
import { useBookkeepingStatusContext } from '@providers/features/bookkeeping/BookkeepingStatusContext/BookkeepingStatusContext'
import { useChartOfAccountsSelectionActions } from '@providers/features/generalLedger/ChartOfAccountsSelectionStore/ChartOfAccountsSelectionStoreProvider'
import { useChartOfAccountsBalances } from '@hooks/features/generalLedger/useChartOfAccountsBalances'
import { Button } from '@ui/Button/Button'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'
import { type ColumnConfig } from '@blocks/Table/DataTable/utils/column'
import { ExpandableDataTable } from '@blocks/Table/ExpandableDataTable/ExpandableDataTable'
import { ExpandableDataTableContext } from '@blocks/Table/ExpandableDataTable/ExpandableDataTableProvider'
import { filterAccounts, getInitialExpandedState, getMatchedTextIndices, getRowId } from '@features/generalLedger/ChartOfAccountsTable/utils'
import { type ChartOfAccountsTableStringOverrides } from '@features/generalLedger/ChartOfAccountsTableWithPanel/ChartOfAccountsTableWithPanel'

import './chartOfAccountsTable.scss'

const LEGACY_CLASS_NAMES = {
  AccountNumber: { column: 'Layer__chart-of-accounts--accountnumber' },
  Name: { column: 'Layer__chart-of-accounts--name' },
  Type: { column: 'Layer__chart-of-accounts--type' },
  Subtype: { column: 'Layer__chart-of-accounts--subtype' },
  Balance: { column: 'Layer__chart-of-accounts--balance' },
  Actions: { column: 'Layer__chart-of-accounts--actions' },
} as const

enum ChartOfAccountsColumn {
  AccountNumber = 'AccountNumber',
  Name = 'Name',
  Type = 'Type',
  Subtype = 'Subtype',
  Balance = 'Balance',
  Actions = 'Actions',
}

const COMPONENT_NAME = 'chart-of-accounts'
const LEGACY_TABLE_CLASS_NAME = 'Layer__chart-of-accounts__table'

const getSubRows = (row: AugmentedLedgerAccountBalance): AugmentedLedgerAccountBalance[] | undefined => {
  return row.subAccounts.length > 0 ? asMutable(row.subAccounts) : undefined
}

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

const ChartOfAccountsEmptyState = () => {
  const { t } = useTranslation()

  return (
    <DataState
      status={DataStateStatus.info}
      title={t('generalLedger:ChartOfAccountsTable.empty.accounts', 'No accounts found')}
      description={t('generalLedger:ChartOfAccountsTable.empty.accounts_match_filters', 'No accounts match the current filters. Click "Add Account" to create a new one.')}
      spacing
    />
  )
}

export const ChartOfAccountsTable = ({
  stringOverrides,
  searchQuery,
  onEditAccount,
  templateAccountsEditable = true,
}: {
  searchQuery: string
  onEditAccount: (accountId: string) => void
  stringOverrides?: ChartOfAccountsTableStringOverrides
  templateAccountsEditable?: boolean
}) => {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()
  const { selectAccount } = useChartOfAccountsSelectionActions()
  const { setExpanded } = useContext(ExpandableDataTableContext)
  const { data, isLoading, isValidating, isError, mutate } = useChartOfAccountsBalances()
  const { trigger: deleteAccount } = useDeleteLedgerAccount()
  const [accountToDelete, setAccountToDelete] = useState<AugmentedLedgerAccountBalance | null>(null)
  const { accountingConfiguration } = useLayerContext()
  const { isActiveBookkeepingStatus } = useBookkeepingStatusContext()
  const enableAccountNumbers = !!accountingConfiguration?.enableAccountNumbers

  const onConfirmDelete = async () => {
    if (!accountToDelete) return
    await deleteAccount({ accountId: accountToDelete.accountId })
  }

  const getDeleteButtonTooltip = useCallback((account: AugmentedLedgerAccountBalance) => {
    if (account.isDeletable) {
      return undefined
    }
    if (account.subAccounts.length > 0) {
      return t('generalLedger:ChartOfAccountsTable.validation.delete_account_has_children', 'This account cannot be deleted because it has child accounts')
    }
    if (account.balance !== 0) {
      return t('generalLedger:ChartOfAccountsTable.validation.delete_account_has_ledger_entries', 'This account cannot be deleted because it has ledger entries')
    }
    return t('generalLedger:ChartOfAccountsTable.validation.delete_account_is_required', 'This account cannot be deleted because it is a required account')
  }, [t])

  const filteredAccounts = useMemo(() => {
    if (!data) return undefined
    if (!searchQuery) return data.accounts

    return filterAccounts(
      asMutable(data.accounts),
      searchQuery.toLowerCase(),
      formatCurrencyFromCents,
    )
  }, [data, formatCurrencyFromCents, searchQuery])

  useLayoutEffect(() => {
    setExpanded(getInitialExpandedState(filteredAccounts))
  }, [filteredAccounts, setExpanded])

  const onClickView = useCallback((row: Row<AugmentedLedgerAccountBalance>, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    selectAccount(row.original.accountId)
  }, [selectAccount])

  const onClickEdit = useCallback((account: AugmentedLedgerAccountBalance, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onEditAccount(account.accountId)
  }, [onEditAccount])

  const onClickDelete = (account: AugmentedLedgerAccountBalance, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setAccountToDelete(account)
  }

  const renderHighlightedValue = useCallback((row: Row<AugmentedLedgerAccountBalance>, text: string) => {
    return highlightMatch({
      text,
      query: searchQuery,
      isMatching: row.original.isMatching,
    })
  }, [searchQuery])

  const renderHighlightedNonRootValue = useCallback((row: Row<AugmentedLedgerAccountBalance>, text: string) => {
    if (row.depth === 0) {
      return null
    }
    return renderHighlightedValue(row, text)
  }, [renderHighlightedValue])

  const ErrorState = useCallback(() => (
    <DataState
      status={DataStateStatus.failed}
      title={t('common:error.something_went_wrong', 'Something went wrong')}
      description={t('common:error.couldnt_load_data', 'We couldn’t load your data.')}
      onRefresh={() => { void mutate() }}
      isLoading={isValidating || isLoading}
      spacing
    />
  ), [mutate, isValidating, isLoading, t])

  const slots = useMemo(() => ({
    EmptyState: ChartOfAccountsEmptyState,
    ErrorState,
  }), [ErrorState])

  const columnConfig = useMemo<ColumnConfig<AugmentedLedgerAccountBalance>>(() => {
    const accountNumberColumn = {
      id: ChartOfAccountsColumn.AccountNumber,
      legacyClassNames: LEGACY_CLASS_NAMES.AccountNumber,
      header: stringOverrides?.numberColumnHeader || t('generalLedger:ChartOfAccountsTable.label.account_number', 'Account Number'),
      cell: (row: Row<AugmentedLedgerAccountBalance>) =>
        renderHighlightedValue(row, row.original.accountNumber || ''),
    }

    const columns: ColumnConfig<AugmentedLedgerAccountBalance> = [
      {
        id: ChartOfAccountsColumn.Name,
        legacyClassNames: LEGACY_CLASS_NAMES.Name,
        header: stringOverrides?.nameColumnHeader || t('generalLedger:ChartOfAccountsTable.label.account_name_title_case', 'Account Name'),
        cell: (row: Row<AugmentedLedgerAccountBalance>) => (
          <Button variant='text' ellipsis onClick={e => onClickView(row, e)}>
            {renderHighlightedValue(row, row.original.name)}
          </Button>
        ),
        isRowHeader: true,
      },
      {
        id: ChartOfAccountsColumn.Type,
        legacyClassNames: LEGACY_CLASS_NAMES.Type,
        header: stringOverrides?.typeColumnHeader || t('common:label.type', 'Type'),
        cell: (row: Row<AugmentedLedgerAccountBalance>) => (
          renderHighlightedNonRootValue(row, row.original.accountType?.displayName || '')
        ),
      },
      {
        id: ChartOfAccountsColumn.Subtype,
        legacyClassNames: LEGACY_CLASS_NAMES.Subtype,
        header: stringOverrides?.subtypeColumnHeader || t('generalLedger:ChartOfAccountsTable.label.sub_type', 'Sub-Type'),
        cell: (row: Row<AugmentedLedgerAccountBalance>) => (
          renderHighlightedNonRootValue(row, row.original.accountSubtype?.displayName || '')
        ),
      },
      {
        id: ChartOfAccountsColumn.Balance,
        legacyClassNames: LEGACY_CLASS_NAMES.Balance,
        header: stringOverrides?.balanceColumnHeader || t('common:label.balance', 'Balance'),
        cell: (row: Row<AugmentedLedgerAccountBalance>) =>
          renderHighlightedValue(row, formatCurrencyFromCents(row.original.balance)),
      },
      {
        id: ChartOfAccountsColumn.Actions,
        legacyClassNames: LEGACY_CLASS_NAMES.Actions,
        header: null,
        alignment: Alignment.Right,
        cell: (row: Row<AugmentedLedgerAccountBalance>) => {
          const account = row.original
          // Top-level accounts have no parent, which the form requires, so they cannot be edited.
          const isTopLevelAccount = row.depth === 0
          const isNonEditable = isTopLevelAccount || (!templateAccountsEditable && !!account.stableName)
          const isDeleteDisabled = !account.isDeletable

          return (
            <HStack className='Layer__coa__actions' gap='xs'>
              <Button
                variant='outlined'
                icon
                aria-label={t('common:action.view_label', 'View')}
                onClick={e => onClickView(row, e)}
              >
                <List size={14} />
              </Button>
              <Button
                variant='outlined'
                icon
                aria-label={t('common:action.edit_label', 'Edit')}
                isDisabled={isNonEditable}
                onClick={e => onClickEdit(account, e)}
                tooltip={isNonEditable ? t('generalLedger:ChartOfAccountsTable.validation.account_not_modifiable', 'This account cannot be modified') : undefined}
              >
                <Pen size={14} />
              </Button>
              {!isActiveBookkeepingStatus && (
                <Button
                  variant='outlined'
                  icon
                  aria-label={t('common:action.delete_label', 'Delete')}
                  onClick={e => onClickDelete(account, e)}
                  isDisabled={isDeleteDisabled}
                  tooltip={getDeleteButtonTooltip(account)}
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </HStack>
          )
        },
      },
    ]

    if (enableAccountNumbers) {
      columns.unshift(accountNumberColumn)
    }

    return columns
  }, [
    enableAccountNumbers,
    formatCurrencyFromCents,
    getDeleteButtonTooltip,
    isActiveBookkeepingStatus,
    onClickEdit,
    onClickView,
    renderHighlightedNonRootValue,
    renderHighlightedValue,
    stringOverrides,
    t,
    templateAccountsEditable,
  ])

  return (
    <>
      <ExpandableDataTable
        componentName={COMPONENT_NAME}
        className={LEGACY_TABLE_CLASS_NAME}
        ariaLabel={t('generalLedger:ChartOfAccountsTable.label.chart_of_accounts', 'Chart of Accounts')}
        columnConfig={columnConfig}
        data={filteredAccounts ? asMutable(filteredAccounts) : undefined}
        isLoading={isLoading}
        isError={isError}
        slots={slots}
        getSubRows={getSubRows}
        getRowId={getRowId}
      />
      <BaseConfirmationModal
        isOpen={accountToDelete !== null}
        onOpenChange={(isOpen: boolean) => {
          if (!isOpen) {
            setAccountToDelete(null)
          }
        }}
        title={t('generalLedger:ChartOfAccountsTable.action.delete_account_name', 'Delete {{accountName}}', { accountName: accountToDelete?.name })}
        description={t('generalLedger:ChartOfAccountsTable.label.account_remove_warning', 'This account will be permanently removed from your Chart of Accounts.')}
        onConfirm={onConfirmDelete}
        confirmLabel={t('generalLedger:ChartOfAccountsTable.action.delete_account', 'Delete Account')}
        cancelLabel={t('common:action.cancel_label', 'Cancel')}
      />
    </>
  )
}
