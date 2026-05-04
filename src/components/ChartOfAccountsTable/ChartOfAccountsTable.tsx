import { type ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { type Row } from '@tanstack/react-table'
import { List, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  type AugmentedLedgerAccountBalance,
  LedgerAccountNodeType,
} from '@internal-types/chartOfAccounts'
import { Alignment } from '@schemas/reports/unifiedReport'
import { asMutable } from '@utils/asMutable'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { ChartOfAccountsContext } from '@contexts/ChartOfAccountsContext/ChartOfAccountsContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { LedgerAccountsContext } from '@contexts/LedgerAccountsContext/LedgerAccountsContext'
import Edit2 from '@icons/Edit2'
import { Button as UIButton } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'
import { Button, ButtonVariant } from '@components/Button/Button'
import { type ChartOfAccountsTableStringOverrides } from '@components/ChartOfAccountsTable/ChartOfAccountsTableWithPanel'
import { filterAccounts, getMatchedTextIndices } from '@components/ChartOfAccountsTable/utils/utils'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { type NestedColumnConfig } from '@components/DataTable/columnUtils'
import { ExpandableDataTable } from '@components/ExpandableDataTable/ExpandableDataTable'

import './chartOfAccountsTable.scss'

enum ChartOfAccountsColumn {
  AccountNumber = 'AccountNumber',
  Name = 'Name',
  Type = 'Type',
  Subtype = 'Subtype',
  Balance = 'Balance',
  Actions = 'Actions',
}

const COMPONENT_NAME = 'chart-of-accounts'

const getSubRows = (row: AugmentedLedgerAccountBalance): AugmentedLedgerAccountBalance[] | undefined => {
  return row.subAccounts.length > 0 ? asMutable(row.subAccounts) : undefined
}

const getRowId = (row: AugmentedLedgerAccountBalance): string => row.accountId

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
  stringOverrides,
  searchQuery,
  templateAccountsEditable = true,
}: {
  searchQuery: string
  stringOverrides?: ChartOfAccountsTableStringOverrides
  templateAccountsEditable?: boolean
}) => {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()
  const { setSelectedAccount } = useContext(LedgerAccountsContext)
  const { data, isLoading, isError, isValidating, refetch, editAccount, deleteAccount } = useContext(ChartOfAccountsContext)
  const [accountToDelete, setAccountToDelete] = useState<AugmentedLedgerAccountBalance | null>(null)
  const { accountingConfiguration } = useLayerContext()
  const enableAccountNumbers = !!accountingConfiguration?.enableAccountNumbers

  const onConfirmDelete = async () => {
    if (!accountToDelete) return
    await deleteAccount(accountToDelete.accountId)
  }

  const getDeleteButtonTooltip = useCallback((account: AugmentedLedgerAccountBalance) => {
    if (account.isDeletable) {
      return undefined
    }
    if (account.subAccounts.length > 0) {
      return t('chartOfAccounts:validation.delete_account_has_children', 'This account cannot be deleted because it has child accounts')
    }
    if (account.balance !== 0) {
      return t('chartOfAccounts:validation.delete_account_has_ledger_entries', 'This account cannot be deleted because it has ledger entries')
    }
    return t('chartOfAccounts:validation.delete_account_is_required', 'This account cannot be deleted because it is a required account')
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

  const getNodeType = (row: Row<AugmentedLedgerAccountBalance>): LedgerAccountNodeType => {
    if (row.depth === 0) return LedgerAccountNodeType.Root
    return row.getCanExpand() ? LedgerAccountNodeType.Parent : LedgerAccountNodeType.Leaf
  }

  const onClickView = useCallback((row: Row<AugmentedLedgerAccountBalance>, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedAccount({ ...row.original, nodeType: getNodeType(row) })
  }, [setSelectedAccount])

  const onClickEdit = useCallback((account: AugmentedLedgerAccountBalance, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    editAccount(account.accountId)
  }, [editAccount])

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

  const EmptyState = () => (
    <DataState
      status={DataStateStatus.info}
      title={t('chartOfAccounts:empty.accounts', 'No accounts found')}
      description={t('chartOfAccounts:empty.accounts_match_filters', 'No accounts match the current filters. Click "Add Account" to create a new one.')}
    />
  )

  const ErrorState = () => (
    <DataState
      status={DataStateStatus.failed}
      title={t('common:error.something_went_wrong', 'Something went wrong')}
      description={t('common:error.couldnt_load_data', 'We couldn’t load your data.')}
      onRefresh={() => void refetch()}
      isLoading={isValidating || isLoading}
    />
  )

  const columnConfig = useMemo<NestedColumnConfig<AugmentedLedgerAccountBalance>>(() => {
    const accountNumberColumn = {
      id: ChartOfAccountsColumn.AccountNumber,
      header: stringOverrides?.numberColumnHeader || t('generalLedger:label.account_number', 'Account Number'),
      cell: (row: Row<AugmentedLedgerAccountBalance>) =>
        renderHighlightedValue(row, row.original.accountNumber || ''),
    }

    const columns: NestedColumnConfig<AugmentedLedgerAccountBalance> = [
      {
        id: ChartOfAccountsColumn.Name,
        header: stringOverrides?.nameColumnHeader || t('generalLedger:label.account_name_title_case', 'Account Name'),
        cell: (row: Row<AugmentedLedgerAccountBalance>) => (
          <UIButton variant='text' ellipsis onClick={e => onClickView(row, e)}>
            {renderHighlightedValue(row, row.original.name)}
          </UIButton>
        ),
        isRowHeader: true,
      },
      {
        id: ChartOfAccountsColumn.Type,
        header: stringOverrides?.typeColumnHeader || t('common:label.type', 'Type'),
        cell: (row: Row<AugmentedLedgerAccountBalance>) => (
          renderHighlightedNonRootValue(row, row.original.accountType?.displayName || '')
        ),
      },
      {
        id: ChartOfAccountsColumn.Subtype,
        header: stringOverrides?.subtypeColumnHeader || t('chartOfAccounts:label.sub_type', 'Sub-Type'),
        cell: (row: Row<AugmentedLedgerAccountBalance>) => (
          renderHighlightedNonRootValue(row, row.original.accountSubtype?.displayName || '')
        ),
      },
      {
        id: ChartOfAccountsColumn.Balance,
        header: stringOverrides?.balanceColumnHeader || t('common:label.balance', 'Balance'),
        cell: (row: Row<AugmentedLedgerAccountBalance>) =>
          renderHighlightedValue(row, formatCurrencyFromCents(row.original.balance)),
      },
      {
        id: ChartOfAccountsColumn.Actions,
        header: null,
        alignment: Alignment.Right,
        cell: (row: Row<AugmentedLedgerAccountBalance>) => {
          const account = row.original
          const isNonEditable = !templateAccountsEditable && !!account.stableName
          const isDeleteDisabled = !account.isDeletable

          return (
            <HStack className='Layer__coa__actions' gap='xs'>
              <Button
                variant={ButtonVariant.secondary}
                rightIcon={<List size={14} />}
                iconOnly
                onClick={e => onClickView(row, e)}
              >
                {t('common:action.view_label', 'View')}
              </Button>
              <Button
                variant={ButtonVariant.secondary}
                rightIcon={<Edit2 size={14} />}
                iconOnly
                disabled={isNonEditable}
                onClick={e => onClickEdit(account, e)}
                tooltip={isNonEditable ? t('chartOfAccounts:validation.account_not_modifiable', 'This account cannot be modified') : undefined}
              >
                {t('common:action.edit_label', 'Edit')}
              </Button>
              <Button
                variant={ButtonVariant.secondary}
                rightIcon={<Trash2 size={14} />}
                iconOnly
                onClick={e => onClickDelete(account, e)}
                disabled={isDeleteDisabled}
                tooltip={getDeleteButtonTooltip(account)}
              >
                {t('common:action.delete_label', 'Delete')}
              </Button>
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
        ariaLabel={t('chartOfAccounts:label.chart_of_accounts', 'Chart of Accounts')}
        columnConfig={columnConfig}
        data={filteredAccounts ? asMutable(filteredAccounts) : undefined}
        isLoading={isLoading}
        isError={isError}
        slots={{ EmptyState, ErrorState }}
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
        title={t('chartOfAccounts:action.delete_account_name', 'Delete {{accountName}}', { accountName: accountToDelete?.name })}
        description={t('chartOfAccounts:label.account_remove_warning', 'This account will be permanently removed from your Chart of Accounts.')}
        onConfirm={onConfirmDelete}
        confirmLabel={t('chartOfAccounts:action.delete_account', 'Delete Account')}
        cancelLabel={t('common:action.cancel_label', 'Cancel')}
      />
    </>
  )
}
