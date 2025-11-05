import { FileInput } from '../Input/FileInput'
import { Button } from '../Button/Button'
import { useRef, useState } from 'react'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext/BankTransactionsContext'
import PaperclipIcon from '../../icons/Paperclip'
import { BankTransaction, SuggestedMatch } from '../../types/bank_transactions'
import {
  hasReceipts,
  getBankTransactionMatchAsSuggestedMatch,
} from '../../utils/bankTransactions'
import { BankTransactionReceipts } from '../BankTransactionReceipts/BankTransactionReceipts'
import { BankTransactionReceiptsHandle } from '../BankTransactionReceipts/BankTransactionReceipts'
import { MatchFormMobile } from '../MatchForm'
import { ErrorText, Text, TextSize, TextWeight } from '../Typography'
import classNames from 'classnames'
import { BankTransactionFormFields } from '../../features/bankTransactions/[bankTransactionId]/components/BankTransactionFormFields'

export const MatchForm = ({
  bankTransaction,
  showReceiptUploads,
  showDescriptions,
  showCategorization,
}: {
  bankTransaction: BankTransaction
  showReceiptUploads?: boolean
  showDescriptions?: boolean
  showCategorization?: boolean
}) => {
  const receiptsRef = useRef<BankTransactionReceiptsHandle>(null)

  const { match: matchBankTransaction, isLoading } =
    useBankTransactionsContext()

  const [selectedMatch, setSelectedMatch] = useState<SuggestedMatch | undefined>(
    getBankTransactionMatchAsSuggestedMatch(bankTransaction),
  )
  const [formError, setFormError] = useState<string | undefined>()

  const showRetry = Boolean(bankTransaction.error)

  const onMatchSubmit = async (matchId: string) => {
    const foundMatch = bankTransaction.suggested_matches?.find(
      x => x.id === matchId,
    )
    if (!foundMatch) {
      return
    }

    await matchBankTransaction(bankTransaction.id, foundMatch.id, true)
  }

  const save = async () => {
    if (!showCategorization) {
      return
    }

    if (!selectedMatch) {
      setFormError('Select an option to match the transaction')
    }
    else if (
      selectedMatch
      && selectedMatch.id !== getBankTransactionMatchAsSuggestedMatch(bankTransaction)?.id
    ) {
      await onMatchSubmit(selectedMatch.id)
    }
    return
  }

  return (
    <div>
      <Text weight={TextWeight.bold} size={TextSize.sm}>
        Find match
      </Text>
      <MatchFormMobile
        classNamePrefix='Layer__bank-transaction-mobile-list-item'
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
            label='Receipts'
          />
        )}
      </div>
      <div className='Layer__bank-transaction-mobile-list-item__actions'>
        {showReceiptUploads && (
          <FileInput
            onUpload={files => receiptsRef.current?.uploadReceipt(files[0])}
            text='Upload receipt'
            iconOnly={true}
            icon={<PaperclipIcon />}
          />
        )}
        {showCategorization && (
          <Button
            fullWidth={true}
            disabled={
              !selectedMatch
              || isLoading
              || bankTransaction.processing
              || selectedMatch.id === getBankTransactionMatchAsSuggestedMatch(bankTransaction)?.id
            }
            onClick={() => { void save() }}
          >
            {isLoading || bankTransaction.processing
              ? 'Saving...'
              : 'Approve match'}
          </Button>
        )}
      </div>
      {formError && <ErrorText>{formError}</ErrorText>}
      {showRetry
        ? (
          <ErrorText>
            Approval failed. Check connection and retry in few seconds.
          </ErrorText>
        )
        : null}
    </div>
  )
}
