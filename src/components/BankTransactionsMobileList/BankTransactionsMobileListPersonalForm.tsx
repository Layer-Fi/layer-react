import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { Paperclip } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { hasReceipts, isCategorized, isCredit } from '@utils/bankTransactions/shared'
import { useCategorizeBankTransactionWithCacheUpdate } from '@hooks/features/bankTransactions/useCategorizeBankTransactionWithCacheUpdate'
import { RECEIPT_ALLOWED_INPUT_FILE_TYPES } from '@hooks/legacy/useReceipts'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { BankTransactionFormFields } from '@components/BankTransactionFormFields/BankTransactionFormFields'
import { BankTransactionReceipts } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { type BankTransactionReceiptsHandle } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { FileInput } from '@components/Input/FileInput'
import { ErrorText } from '@components/Typography/ErrorText'

import { LegacyPersonalCategories, PersonalStableName } from './constants'

interface BankTransactionsMobileListPersonalFormProps {
  bankTransaction: BankTransaction
  showReceiptUploads?: boolean
  showDescriptions?: boolean
  showCategorization?: boolean
}

const isAlreadyAssigned = (bankTransaction: BankTransaction) => {
  if (
    bankTransaction.categorizationStatus === CategorizationStatus.MATCHED
    || bankTransaction?.categorizationStatus === CategorizationStatus.SPLIT
  ) {
    return false
  }

  if (!bankTransaction.category) {
    return false
  }

  const category = bankTransaction.category

  if (category.type === 'Account' && 'stableName' in category) {
    const stableName = category.stableName
    if (stableName === PersonalStableName.CREDIT || stableName === PersonalStableName.DEBIT) {
      return true
    }
  }

  if (category.type === 'Exclusion') {
    const displayName = category.displayName
    if (Object.values(LegacyPersonalCategories).includes(displayName as LegacyPersonalCategories)) {
      return true
    }
  }

  return false
}

export const BankTransactionsMobileListPersonalForm = ({
  bankTransaction,
  showReceiptUploads,
  showDescriptions,
  showCategorization,
}: BankTransactionsMobileListPersonalFormProps) => {
  const { t } = useTranslation()
  const receiptsRef = useRef<BankTransactionReceiptsHandle>(null)

  const {
    categorize: categorizeBankTransaction,
    isMutating: isCategorizing,
    isError: isErrorCategorizing,
  } = useCategorizeBankTransactionWithCacheUpdate()

  const [showRetry, setShowRetry] = useState(false)

  useEffect(() => {
    if (isErrorCategorizing) {
      setShowRetry(true)
    }
  }, [isErrorCategorizing])

  const save = () => {
    if (!showCategorization) {
      return
    }

    void categorizeBankTransaction(
      bankTransaction.id,
      {
        type: 'Category',
        category: {
          type: 'StableName',
          stableName: isCredit(bankTransaction)
            ? PersonalStableName.CREDIT
            : PersonalStableName.DEBIT,
        },
        taxCode: null,
      },
    )
  }

  const alreadyAssigned = isAlreadyAssigned(bankTransaction)

  return (
    <VStack gap='sm'>
      <BankTransactionFormFields
        bankTransaction={bankTransaction}
        showDescriptions={showDescriptions}
        hideCustomerVendor
        hideTags
        isMobile
      />
      <div
        className={classNames(
          'Layer__bank-transaction-mobile-list-item__receipts',
          hasReceipts(bankTransaction)
            ? 'Layer__bank-transaction-mobile-list-item__actions--with-receipts'
            : undefined,
        )}
      >
        {showReceiptUploads && (
          <BankTransactionReceipts
            ref={receiptsRef}
            floatingActions={false}
            hideUploadButtons={true}
            label={t('bankTransactions:label.receipts', 'Receipts')}
          />
        )}
      </div>
      <HStack gap='md'>
        {showReceiptUploads && (
          <FileInput
            onUpload={files => receiptsRef.current?.uploadReceipt(files[0])}
            text={t('bankTransactions:action.upload_receipt', 'Upload receipt')}
            iconOnly={true}
            icon={<Paperclip size={20} />}
            accept={RECEIPT_ALLOWED_INPUT_FILE_TYPES}
          />
        )}
        {showCategorization
          && (
            <Button
              fullWidth
              onClick={save}
              isDisabled={alreadyAssigned || isCategorizing}
            >
              {isCategorizing
                ? (isCategorized(bankTransaction)
                  ? t('common:state.updating', 'Updating...')
                  : t('common:state.confirming', 'Confirming...'))
                : alreadyAssigned
                  ? t('common:state.updated', 'Updated')
                  : t('bankTransactions:action.mark_as_personal', 'Mark as Personal')}
            </Button>
          )}
      </HStack>
      {isErrorCategorizing && showRetry
        ? (
          <ErrorText size='sm' align='center' pb='sm'>
            {t('bankTransactions:error.approval_failed_check_connection', 'Approval failed. Check connection and retry in a few seconds.')}
          </ErrorText>
        )
        : null}
    </VStack>
  )
}
