import React, { useEffect, useRef, useState } from 'react'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import PaperclipIcon from '../../icons/Paperclip'
import { BankTransaction } from '../../types'
import { hasReceipts, isAlreadyMatched } from '../../utils/bankTransactions'
import { BankTransactionReceipts } from '../BankTransactionReceipts'
import { BankTransactionReceiptsHandle } from '../BankTransactionReceipts/BankTransactionReceipts'
import { Button } from '../Button'
import { FileInput } from '../Input'
import { MatchFormMobile } from '../MatchForm'
import { ErrorText, Text, TextSize, TextWeight } from '../Typography'
import classNames from 'classnames'

export const MatchForm = ({
  bankTransaction,
  showReceiptUploads,
}: {
  bankTransaction: BankTransaction
  showReceiptUploads?: boolean
}) => {
  const receiptsRef = useRef<BankTransactionReceiptsHandle>(null)

  const { match: matchBankTransaction, isLoading } =
    useBankTransactionsContext()
  const [selectedMatchId, setSelectedMatchId] = useState<string | undefined>(
    isAlreadyMatched(bankTransaction) ??
      (bankTransaction.suggested_matches &&
      bankTransaction.suggested_matches?.length > 0
        ? bankTransaction.suggested_matches[0].id
        : undefined),
  )
  const [formError, setFormError] = useState<string | undefined>()
  const [showRetry, setShowRetry] = useState(false)

  useEffect(() => {
    if (bankTransaction.error) {
      setShowRetry(true)
    } else if (showRetry) {
      setShowRetry(false)
    }
  }, [bankTransaction.error])

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
    if (!selectedMatchId) {
      setFormError('Select an option to match the transaction')
    } else if (
      selectedMatchId &&
      selectedMatchId !== isAlreadyMatched(bankTransaction)
    ) {
      onMatchSubmit(selectedMatchId)
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
        bankTransaction={bankTransaction}
        selectedMatchId={selectedMatchId}
        setSelectedMatchId={id => {
          setFormError(undefined)
          setSelectedMatchId(id)
        }}
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
            onUpload={receiptsRef.current?.uploadReceipt}
            text='Upload receipt'
            iconOnly={true}
            icon={<PaperclipIcon />}
          />
        )}
        <Button
          fullWidth={true}
          disabled={
            !selectedMatchId ||
            isLoading ||
            bankTransaction.processing ||
            selectedMatchId === isAlreadyMatched(bankTransaction)
          }
          onClick={save}
        >
          {isLoading || bankTransaction.processing
            ? 'Saving...'
            : 'Approve match'}
        </Button>
      </div>
      {formError && <ErrorText>{formError}</ErrorText>}
      {bankTransaction.error && showRetry ? (
        <ErrorText>
          Approval failed. Check connection and retry in few seconds.
        </ErrorText>
      ) : null}
    </div>
  )
}
