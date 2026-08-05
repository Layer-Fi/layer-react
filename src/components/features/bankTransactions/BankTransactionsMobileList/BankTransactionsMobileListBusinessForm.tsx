import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { Paperclip } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/features/bankTransactions/bankTransaction'
import { hasReceipts, isCategorized } from '@utils/features/bankTransactions/shared'
import { resolveCategoryTaxCode } from '@utils/features/bankTransactions/taxCode'
import { RECEIPT_ALLOWED_INPUT_FILE_TYPES } from '@hooks/legacy/useReceipts'
import { useCategorizeBankTransactionWithCacheUpdate } from '@hooks/features/bankTransactions/useCategorizeBankTransactionWithCacheUpdate'
import { useGetBankTransactionCategorizationWithDefault } from '@hooks/features/bankTransactions/useGetBankTransactionCategorizationWithDefault'
import { Button } from '@ui/Button/Button'
import { FileInput } from '@ui/Input/FileInput'
import { HStack, VStack } from '@ui/Stack/Stack'
import { ErrorText } from '@ui/Typography/ErrorText'
import { BankTransactionFormFields } from '@features/bankTransactions/BankTransactionFormFields/BankTransactionFormFields'
import { BankTransactionReceipts } from '@features/bankTransactions/BankTransactionReceipts/BankTransactionReceipts'
import { type BankTransactionReceiptsHandle } from '@features/bankTransactions/BankTransactionReceipts/BankTransactionReceipts'
import { BankTransactionsMobileCategorySelection } from '@features/bankTransactions/BankTransactionsMobileCategorySelection/BankTransactionsMobileCategorySelection'
interface BankTransactionsMobileListBusinessFormProps {
  bankTransaction: BankTransaction
  showCategorization?: boolean
}

export const BankTransactionsMobileListBusinessForm = ({
  bankTransaction,
  showCategorization,
}: BankTransactionsMobileListBusinessFormProps) => {
  const { t } = useTranslation()
  const receiptsRef = useRef<BankTransactionReceiptsHandle>(null)

  const {
    categorize: categorizeBankTransaction,
    isMutating: isCategorizing,
    isError: isErrorCategorizing,
  } = useCategorizeBankTransactionWithCacheUpdate()

  const selectedCategorization = useGetBankTransactionCategorizationWithDefault(bankTransaction)
  const { category: selectedCategory, taxCode: selectedTaxCode } = selectedCategorization

  const [showRetry, setShowRetry] = useState(false)

  useEffect(() => {
    if (isErrorCategorizing) {
      setShowRetry(true)
    }
  }, [isErrorCategorizing])

  const save = () => {
    if (!selectedCategory) {
      return
    }

    const payload = selectedCategory.classification
    if (payload === null) return

    void categorizeBankTransaction(
      bankTransaction.id,
      {
        type: 'Category',
        category: payload,
        taxCode: resolveCategoryTaxCode(
          bankTransaction,
          selectedCategory,
          selectedTaxCode,
        ),
      },
    )
  }

  return (
    <>
      <VStack gap='sm'>
        {showCategorization && (
          <BankTransactionsMobileCategorySelection
            bankTransaction={bankTransaction}
            isSubmitting={isCategorizing}
          />
        )}
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
            label={t('bankTransactions:label.receipts', 'Receipts')}
            ref={receiptsRef}
            floatingActions={false}
            hideUploadButtons={true}
          />
        </div>
        <HStack gap='xs'>
          <FileInput
            onUpload={files => receiptsRef.current?.uploadReceipt(files[0])}
            text={t('bankTransactions:action.upload_receipt', 'Upload receipt')}
            icon
            slots={{ Icon: <Paperclip size={20} /> }}
            accept={RECEIPT_ALLOWED_INPUT_FILE_TYPES}
          />
          {showCategorization && (
            <Button
              onClick={save}
              fullWidth
              isDisabled={!selectedCategory || isCategorizing}
            >
              {isCategorizing
                ? (isCategorized(bankTransaction)
                  ? t('common:state.updating', 'Updating...')
                  : t('common:state.confirming', 'Confirming...'))
                : (isCategorized(bankTransaction)
                  ? t('common:action.update_label', 'Update')
                  : t('common:action.confirm_label', 'Confirm'))}
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
    </>

  )
}
