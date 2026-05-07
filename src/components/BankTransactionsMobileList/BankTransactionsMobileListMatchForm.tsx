import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { SuggestedMatchAsOption } from '@internal-types/categorizationOption'
import {
  getBankTransactionMatchAsSuggestedMatch,
} from '@utils/bankTransactions/shared'
import { useGetBankTransactionCategorizationWithDefault } from '@hooks/features/bankTransactions/useGetBankTransactionCategorizationWithDefault'
import { useMatchBankTransactionWithCacheUpdate } from '@hooks/features/bankTransactions/useMatchBankTransactionWithCacheUpdate'
import { RECEIPT_ALLOWED_INPUT_FILE_TYPES } from '@hooks/legacy/useReceipts'
import {
  useBankTransactionsCategorizationActions,
} from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import PaperclipIcon from '@icons/Paperclip'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { BankTransactionFormFields } from '@components/BankTransactionFormFields/BankTransactionFormFields'
import { BankTransactionReceipts } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { type BankTransactionReceiptsHandle } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { FileInput } from '@components/Input/FileInput'
import { MatchFormMobile } from '@components/MatchForm/MatchFormMobile'
import { ErrorText } from '@components/Typography/ErrorText'

interface BankTransactionsMobileListMatchFormProps {
  bankTransaction: BankTransaction
  showReceiptUploads?: boolean
  showDescriptions?: boolean
  showCategorization?: boolean
}

export const BankTransactionsMobileListMatchForm = ({
  bankTransaction,
  showReceiptUploads,
  showDescriptions,
  showCategorization,
}: BankTransactionsMobileListMatchFormProps) => {
  const { t } = useTranslation()
  const receiptsRef = useRef<BankTransactionReceiptsHandle>(null)

  const {
    match: matchBankTransaction,
    isMutating: isMatching,
    isError: isErrorMatching,
  } = useMatchBankTransactionWithCacheUpdate()
  const { setTransactionMatchSelection } = useBankTransactionsCategorizationActions()
  const selectedCategorization = useGetBankTransactionCategorizationWithDefault(bankTransaction)
  const { match: selectedMatch } = selectedCategorization
  const selectedMatchId = selectedMatch?.original.id

  const [formError, setFormError] = useState<string | undefined>()

  const onMatchSubmit = useCallback(async (matchId: string) => {
    await matchBankTransaction(bankTransaction, matchId, true)
  }, [matchBankTransaction, bankTransaction])

  const save = useCallback(() => {
    if (!showCategorization) return

    if (!selectedMatchId) {
      setFormError(t('bankTransactions:error.select_option_match_transaction', 'Select an option to match the transaction'))
      return
    }

    if (selectedMatchId !== getBankTransactionMatchAsSuggestedMatch(bankTransaction)?.id) {
      void onMatchSubmit(selectedMatchId)
    }
  }, [showCategorization, selectedMatchId, bankTransaction, t, onMatchSubmit])

  return (
    <VStack gap='sm'>
      <Span size='sm' weight='bold'>
        {t('bankTransactions:label.find_match', 'Find Match')}
      </Span>
      <MatchFormMobile
        readOnly={!showCategorization}
        bankTransaction={bankTransaction}
        selectedMatchId={selectedMatchId}
        setSelectedMatch={(suggestedMatch) => {
          setFormError(undefined)
          setTransactionMatchSelection(
            bankTransaction.id,
            suggestedMatch ? new SuggestedMatchAsOption(suggestedMatch) : null,
          )
        }}
      />
      <BankTransactionFormFields
        bankTransaction={bankTransaction}
        showDescriptions={showDescriptions}
        hideCustomerVendor
        hideTags
        isMobile
      />
      {showReceiptUploads && (
        <BankTransactionReceipts
          ref={receiptsRef}
          floatingActions={false}
          hideUploadButtons={true}
          label={t('bankTransactions:label.receipts', 'Receipts')}
        />
      )}
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
            isDisabled={
              !selectedMatchId
              || isMatching
              || selectedMatchId === getBankTransactionMatchAsSuggestedMatch(bankTransaction)?.id
            }
            onClick={save}
          >
            {isMatching
              ? t('common:state.saving', 'Saving...')
              : t('bankTransactions:action.approve_match', 'Approve match')}
          </Button>
        )}
      </HStack>
      {formError && <ErrorText>{formError}</ErrorText>}
      {isErrorMatching
        && (
          <ErrorText>
            {t('bankTransactions:error.approval_failed_check_connection', 'Approval failed. Check connection and retry in a few seconds.')}
          </ErrorText>
        )}
    </VStack>
  )
}
