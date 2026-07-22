import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { Paperclip } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { hasReceipts, isCategorized } from '@utils/bankTransactions/shared'
import { resolveCategoryTaxCode } from '@utils/bankTransactions/taxCode'
import { useCategorizeBankTransactionWithCacheUpdate } from '@hooks/features/bankTransactions/useCategorizeBankTransactionWithCacheUpdate'
import { useGetBankTransactionCategorizationWithDefault } from '@hooks/features/bankTransactions/useGetBankTransactionCategorizationWithDefault'
import { RECEIPT_ALLOWED_INPUT_FILE_TYPES } from '@hooks/legacy/useReceipts'
import { BankTransactionsFeature, useIsBankTransactionsFeatureEnabled } from '@providers/BankTransactionsFeatureVisibility/BankTransactionsFeatureVisibilityProvider'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { BankTransactionFormFields } from '@components/BankTransactionFormFields/BankTransactionFormFields'
import { BankTransactionReceipts } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { type BankTransactionReceiptsHandle } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { BankTransactionsMobileCategorySelection } from '@components/BankTransactionsMobileCategorySelection/BankTransactionsMobileCategorySelection'
import { FileInput } from '@components/Input/FileInput'
import { ErrorText } from '@components/Typography/ErrorText'
interface BankTransactionsMobileListBusinessFormProps {
  bankTransaction: BankTransaction
  showCategorization?: boolean
}

export const BankTransactionsMobileListBusinessForm = ({
  bankTransaction,
  showCategorization,
}: BankTransactionsMobileListBusinessFormProps) => {
  const { t } = useTranslation()
  const showReceiptUploads = useIsBankTransactionsFeatureEnabled(BankTransactionsFeature.ReceiptUploads)
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
          {showReceiptUploads && (
            <BankTransactionReceipts
              label={t('bankTransactions:label.receipts', 'Receipts')}
              ref={receiptsRef}
              floatingActions={false}
              hideUploadButtons={true}
            />
          )}
        </div>
        <HStack gap='xs'>
          {showReceiptUploads && (
            <FileInput
              onUpload={files => receiptsRef.current?.uploadReceipt(files[0])}
              text={t('bankTransactions:action.upload_receipt', 'Upload receipt')}
              icon
              slots={{ Icon: <Paperclip size={20} /> }}
              accept={RECEIPT_ALLOWED_INPUT_FILE_TYPES}
            />
          )}
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
