import { useRef, useState } from 'react'

import { type BankTransaction, type SuggestedMatch } from '@internal-types/bank_transactions'
import {
  getBankTransactionFirstSuggestedMatch,
  getBankTransactionMatchAsSuggestedMatch,
} from '@utils/bankTransactions'
import { useMatchBankTransactionWithCacheUpdate } from '@hooks/useBankTransactions/useMatchBankTransactionWithCacheUpdate'
import { RECEIPT_ALLOWED_INPUT_FILE_TYPES } from '@hooks/useReceipts/useReceipts'
import PaperclipIcon from '@icons/Paperclip'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { BankTransactionReceipts } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { type BankTransactionReceiptsHandle } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { FileInput } from '@components/Input/FileInput'
import { MatchFormMobile } from '@components/MatchForm/MatchFormMobile'
import { ErrorText } from '@components/Typography/ErrorText'
import { BankTransactionFormFields } from '@features/bankTransactions/[bankTransactionId]/components/BankTransactionFormFields'

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
  const receiptsRef = useRef<BankTransactionReceiptsHandle>(null)

  const {
    match: matchBankTransaction,
    isMutating: isMatching,
    isError: isErrorMatching,
  } = useMatchBankTransactionWithCacheUpdate()

  const [selectedMatch, setSelectedMatch] = useState<SuggestedMatch | undefined>(
    getBankTransactionFirstSuggestedMatch(bankTransaction),
  )
  const [formError, setFormError] = useState<string | undefined>()

  const onMatchSubmit = async (matchId: string) => {
    const foundMatch = bankTransaction.suggested_matches?.find(
      x => x.id === matchId,
    )
    if (!foundMatch) {
      return
    }

    await matchBankTransaction(bankTransaction, foundMatch.id, true)
  }

  const save = () => {
    if (!showCategorization) {
      return
    }

    if (!selectedMatch) {
      setFormError('Select an option to match the transaction')
    }

    if (
      selectedMatch
      && selectedMatch.id !== getBankTransactionMatchAsSuggestedMatch(bankTransaction)?.id
    ) {
      void onMatchSubmit(selectedMatch.id)
    }
    return
  }

  return (
    <VStack gap='sm'>
      <Span size='sm' weight='bold'>
        Find Match
      </Span>
      <MatchFormMobile
        readOnly={!showCategorization}
        bankTransaction={bankTransaction}
        selectedMatchId={selectedMatch?.id}
        setSelectedMatch={(suggestedMatch) => {
          setFormError(undefined)
          setSelectedMatch(suggestedMatch)
        }}
      />
      <BankTransactionFormFields
        bankTransaction={bankTransaction}
        showDescriptions={showDescriptions}
        hideCustomerVendor
        hideTags
      />
      {showReceiptUploads && (
        <BankTransactionReceipts
          ref={receiptsRef}
          floatingActions={false}
          hideUploadButtons={true}
          label='Receipts'
        />
      )}
      <HStack gap='md'>
        {showReceiptUploads && (
          <FileInput
            onUpload={file => receiptsRef.current?.uploadReceipt(file)}
            text='Upload receipt'
            iconOnly={true}
            icon={<PaperclipIcon />}
            accept={RECEIPT_ALLOWED_INPUT_FILE_TYPES}
          />
        )}
        {showCategorization && (
          <Button
            fullWidth
            isDisabled={
              !selectedMatch
              || isMatching
              || selectedMatch.id === getBankTransactionMatchAsSuggestedMatch(bankTransaction)?.id
            }
            onClick={save}
          >
            {isMatching
              ? 'Saving...'
              : 'Approve match'}
          </Button>
        )}
      </HStack>
      {formError && <ErrorText>{formError}</ErrorText>}
      {isErrorMatching
        && (
          <ErrorText>
            Approval failed. Check connection and retry in few seconds.
          </ErrorText>
        )}
    </VStack>
  )
}
