import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { Paperclip } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/features/bankTransactions/bankTransaction'
import { CategorizationStatus } from '@schemas/features/bankTransactions/bankTransaction'
import { hasReceipts, isCategorized, isMoneyIn } from '@utils/features/bankTransactions/shared'
import { RECEIPT_ALLOWED_INPUT_FILE_TYPES } from '@hooks/legacy/useReceipts'
import { useCategorizeBankTransactionWithCacheUpdate } from '@hooks/features/bankTransactions/useCategorizeBankTransactionWithCacheUpdate'
import { Button } from '@ui/Button/Button'
import { FileInput } from '@ui/Input/FileInput'
import { HStack, VStack } from '@ui/Stack/Stack'
import { ErrorText } from '@ui/Typography/ErrorText'
import { BankTransactionFormFields } from '@features/bankTransactions/BankTransactionFormFields/BankTransactionFormFields'
import { BankTransactionReceipts } from '@features/bankTransactions/BankTransactionReceipts/BankTransactionReceipts'
import { type BankTransactionReceiptsHandle } from '@features/bankTransactions/BankTransactionReceipts/BankTransactionReceipts'

import { LegacyPersonalCategories, PersonalStableName } from './personalCategories'

interface BankTransactionsMobileListPersonalFormProps {
  bankTransaction: BankTransaction
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
          stableName: isMoneyIn(bankTransaction)
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
        hideCustomerVendor
        hideTags
        isMobile
      />
      <div
        className={classNames(
          'Layer__BankTransactionsMobileListItem__Receipts',
          hasReceipts(bankTransaction)
            ? 'Layer__BankTransactionsMobileListItem__Receipts--WithReceipts'
            : undefined,
        )}
      >
        <BankTransactionReceipts
          ref={receiptsRef}
          floatingActions={false}
          hideUploadButtons={true}
          label={t('bankTransactions:BankTransactionsMobileList.BankTransactionsMobileListPersonalForm.label.receipts', 'Receipts')}
        />
      </div>
      <HStack gap='md'>
        <FileInput
          onUpload={files => receiptsRef.current?.uploadReceipt(files[0])}
          text={t('bankTransactions:BankTransactionsMobileList.BankTransactionsMobileListPersonalForm.action.upload_receipt', 'Upload receipt')}
          icon
          slots={{ Icon: <Paperclip size={20} /> }}
          accept={RECEIPT_ALLOWED_INPUT_FILE_TYPES}
        />
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
                  : t('bankTransactions:BankTransactionsMobileList.BankTransactionsMobileListPersonalForm.action.mark_as_personal', 'Mark as Personal')}
            </Button>
          )}
      </HStack>
      {isErrorCategorizing && showRetry
        ? (
          <ErrorText size='sm' align='center' pb='sm'>
            {t('bankTransactions:BankTransactionsMobileList.BankTransactionsMobileListPersonalForm.error.approval_failed_check_connection', 'Approval failed. Check connection and retry in a few seconds.')}
          </ErrorText>
        )
        : null}
    </VStack>
  )
}
