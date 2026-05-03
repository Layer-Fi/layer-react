import { useTranslation } from 'react-i18next'

import { isCategorized } from '@utils/bankTransactions/shared'
import { RECEIPT_ALLOWED_INPUT_FILE_TYPES } from '@hooks/legacy/useReceipts'
import PaperclipIcon from '@icons/Paperclip'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { FileInput } from '@components/Input/FileInput'

import { useBankTransactionsMobileListSplitFormContext } from './BankTransactionsMobileListSplitFormContext'

export const BankTransactionsMobileListSplitFormSubmitActions = () => {
  const { t } = useTranslation()
  const {
    transaction: {
      bankTransaction,
      showCategorization,
      showReceiptUploads,
    },
    categorization: {
      isCategorizing,
      save,
    },
    receipts: { receiptsRef },
  } = useBankTransactionsMobileListSplitFormContext()

  return (
    <HStack gap='md'>
      {showReceiptUploads && (
        <FileInput
          onUpload={files => receiptsRef.current?.uploadReceipt(files[0])}
          text={t('bankTransactions:action.upload_receipt', 'Upload receipt')}
          iconOnly={true}
          icon={<PaperclipIcon />}
          accept={RECEIPT_ALLOWED_INPUT_FILE_TYPES}
        />
      )}
      {showCategorization && (
        <Button
          fullWidth
          onClick={save}
          isDisabled={isCategorizing}
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
  )
}
