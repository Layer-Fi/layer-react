import { useMemo } from 'react'
import classNames from 'classnames'

import { bankTransactionFiltersToHookOptions } from '@hooks/useBankTransactions/useAugmentedBankTransactions'
import { useBankTransactionsDownload } from '@hooks/useBankTransactions/useBankTransactionsDownload'
import { useBankTransactionsFiltersContext } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { HStack } from '@ui/Stack/Stack'
import { BankTransactionsHeaderMenu, BankTransactionsHeaderMenuActions } from '@components/BankTransactions/BankTransactionsHeaderMenu'
import { BankTransactionsActions } from '@components/BankTransactionsActions/BankTransactionsActions'
import { ButtonVariant } from '@components/Button/Button'
import { DownloadButton as DownloadButtonComponent } from '@components/Button/DownloadButton'
import { Header } from '@components/Container/Header'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'

import type {
  BankTransactionsHeaderSharedProps,
  BankTransactionsHeaderTableViewExtraProps,
} from './BankTransactionsHeader'
import { TransactionsSearch } from './BankTransactionsHeader'

function DownloadButton({
  downloadButtonTextOverride,
  iconOnly,
  disabled,
}: {
  downloadButtonTextOverride?: string
  iconOnly?: boolean
  disabled?: boolean
}) {
  const { filters } = useBankTransactionsFiltersContext()

  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { trigger, isMutating, error } = useBankTransactionsDownload()

  const handleClick = () => {
    void trigger(bankTransactionFiltersToHookOptions(filters))
      .then((result) => {
        if (result?.presignedUrl) {
          triggerInvisibleDownload({ url: result.presignedUrl })
        }
      })
  }

  return (
    <>
      <DownloadButtonComponent
        variant={ButtonVariant.secondary}
        iconOnly={iconOnly}
        onClick={handleClick}
        isDownloading={isMutating}
        requestFailed={Boolean(error)}
        text={downloadButtonTextOverride ?? 'Download'}
        disabled={disabled}
      />
      <InvisibleDownload ref={invisibleDownloadRef} />
    </>
  )
}

type BankTransactionsHeaderTableViewProps =
  & BankTransactionsHeaderSharedProps
  & BankTransactionsHeaderTableViewExtraProps

export function BankTransactionsHeaderTableView({
  shiftStickyHeader,
  withDatePicker,
  mobileComponent,
  listView,
  showBulkActions,
  headerTopRow,
  statusToggle,
  bulkActionsModule,
  stringOverrides,
  withUploadMenu,
  showCategorizationRules = false,
  collapseHeader,
}: BankTransactionsHeaderTableViewProps) {
  const headerMenuActions = useMemo(() => {
    const actions: BankTransactionsHeaderMenuActions[] = []
    if (withUploadMenu) {
      actions.push(BankTransactionsHeaderMenuActions.UploadTransactions)
    }
    if (showCategorizationRules) {
      actions.push(BankTransactionsHeaderMenuActions.ManageCategorizationRules)
    }
    return actions
  }, [withUploadMenu, showCategorizationRules])

  return (
    <Header
      className={classNames(
        'Layer__bank-transactions__header',
        withDatePicker && 'Layer__bank-transactions__header--with-date-picker',
        mobileComponent && listView
          ? 'Layer__bank-transactions__header--mobile'
          : undefined,
      )}
      style={{ top: shiftStickyHeader }}
    >
      {!collapseHeader && headerTopRow}

      <BankTransactionsActions>
        {showBulkActions
          ? bulkActionsModule
          : (
            <HStack slot='toggle' justify='center' gap='xs'>
              {collapseHeader && headerTopRow}
              {statusToggle}
            </HStack>
          )}
        <TransactionsSearch slot='search' isDisabled={showBulkActions} />
        <HStack slot='download-upload' justify='center' gap='xs'>
          <DownloadButton
            downloadButtonTextOverride={stringOverrides?.downloadButton}
            iconOnly={listView}
            disabled={showBulkActions}
          />
          <BankTransactionsHeaderMenu actions={headerMenuActions} isDisabled={showBulkActions} />
        </HStack>
      </BankTransactionsActions>
    </Header>
  )
}
