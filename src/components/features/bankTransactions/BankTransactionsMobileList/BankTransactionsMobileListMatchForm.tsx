import { useCallback, useRef, useState } from 'react'
import { Paperclip } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/features/bankTransactions/bankTransaction'
import { SuggestedMatchAsOption } from '@internal-types/features/categorization/categorizationOption'
import {
  getBankTransactionMatchAsSuggestedMatch,
} from '@utils/features/bankTransactions/shared'
import {
  useBankTransactionsCategorizationActions,
} from '@providers/features/categorization/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { RECEIPT_ALLOWED_INPUT_FILE_TYPES } from '@hooks/legacy/useReceipts'
import { useGetBankTransactionCategorizationWithDefault } from '@hooks/features/bankTransactions/useGetBankTransactionCategorizationWithDefault'
import { useMatchBankTransactionWithCacheUpdate } from '@hooks/features/bankTransactions/useMatchBankTransactionWithCacheUpdate'
import { Button } from '@ui/Button/Button'
import { FileInput } from '@ui/Input/FileInput'
import { HStack, VStack } from '@ui/Stack/Stack'
import { ErrorText } from '@ui/Typography/ErrorText'
import { Span } from '@ui/Typography/Text'
import { BankTransactionFormFields } from '@features/bankTransactions/BankTransactionFormFields/BankTransactionFormFields'
import { BankTransactionMatchList } from '@features/bankTransactions/BankTransactionMatchList/BankTransactionMatchList'
import { BankTransactionReceipts } from '@features/bankTransactions/BankTransactionReceipts/BankTransactionReceipts'
import { type BankTransactionReceiptsHandle } from '@features/bankTransactions/BankTransactionReceipts/BankTransactionReceipts'

interface BankTransactionsMobileListMatchFormProps {
  bankTransaction: BankTransaction
  showCategorization?: boolean
}

export const BankTransactionsMobileListMatchForm = ({
  bankTransaction,
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
    await matchBankTransaction(bankTransaction, matchId)
  }, [matchBankTransaction, bankTransaction])

  const save = useCallback(() => {
    if (!showCategorization) return

    if (!selectedMatchId) {
      setFormError(t('bankTransactions:BankTransactionsMobileList.error.select_option_match_transaction', 'Select an option to match the transaction'))
      return
    }

    if (selectedMatchId !== getBankTransactionMatchAsSuggestedMatch(bankTransaction)?.id) {
      void onMatchSubmit(selectedMatchId)
    }
  }, [showCategorization, selectedMatchId, bankTransaction, t, onMatchSubmit])

  return (
    <VStack gap='3xs'>
      <Span size='sm' weight='bold'>
        {t('bankTransactions:BankTransactionsMobileList.label.find_match', 'Find Match')}
      </Span>
      <BankTransactionMatchList
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
        hideCustomerVendor
        hideTags
        isMobile
      />
      <BankTransactionReceipts
        ref={receiptsRef}
        floatingActions={false}
        hideUploadButtons={true}
        label={t('bankTransactions:BankTransactionsMobileList.label.receipts', 'Receipts')}
      />
      <HStack gap='md'>
        <FileInput
          onUpload={files => receiptsRef.current?.uploadReceipt(files[0])}
          text={t('bankTransactions:BankTransactionsMobileList.action.upload_receipt', 'Upload receipt')}
          icon
          slots={{ Icon: <Paperclip size={20} /> }}
          accept={RECEIPT_ALLOWED_INPUT_FILE_TYPES}
        />
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
              : t('bankTransactions:BankTransactionsMobileList.action.approve_match', 'Approve match')}
          </Button>
        )}
      </HStack>
      {formError && <ErrorText size='sm' align='center' pb='sm'>{formError}</ErrorText>}
      {isErrorMatching
        && (
          <ErrorText size='sm' align='center' pb='sm'>
            {t('bankTransactions:BankTransactionsMobileList.error.approval_failed_check_connection', 'Approval failed. Check connection and retry in a few seconds.')}
          </ErrorText>
        )}
    </VStack>
  )
}
