import React, { useEffect, useState } from 'react'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import { BankTransaction } from '../../types'
import { isAlreadyMatched } from '../../utils/bankTransactions'
import { Button } from '../Button'
import { MatchFormMobile } from '../MatchForm'
import { ErrorText, Text, TextSize, TextWeight } from '../Typography'

export const MatchForm = ({
  bankTransaction,
  hardRefreshPnlOnCategorize,
}: {
  bankTransaction: BankTransaction
  hardRefreshPnlOnCategorize?: boolean
}) => {
  const { match: matchBankTransaction, isLoading } =
    useBankTransactionsContext()
  const [selectedMatchId, setSelectedMatchId] = useState<string | undefined>(
    isAlreadyMatched(bankTransaction),
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
      {formError && <ErrorText>{formError}</ErrorText>}
      {bankTransaction.error && showRetry ? (
        <ErrorText>
          Approval failed. Check connection and retry in few seconds.
        </ErrorText>
      ) : null}
    </div>
  )
}
