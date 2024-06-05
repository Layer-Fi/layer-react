import React, { useEffect, useState } from 'react'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import Trash from '../../icons/Trash'
import {
  centsToDollars as formatMoney,
  dollarsToCents as parseMoney,
} from '../../models/Money'
import { BankTransaction } from '../../types'
import {
  SingleCategoryUpdate,
  SplitCategoryUpdate,
  hasSuggestions,
} from '../../types/categories'
import { hasMatch } from '../../utils/bankTransactions'
import { Button, ButtonVariant, RetryButton, TextButton } from '../Button'
import { CategorySelect } from '../CategorySelect'
import {
  CategoryOption,
  mapCategoryToOption,
} from '../CategorySelect/CategorySelect'
import { Input } from '../Input'
import { MatchFormMobile } from '../MatchForm'
import { ErrorText, Text, TextSize, TextWeight } from '../Typography'

interface SplitAndMatchFormProps {
  bankTransaction: BankTransaction
}

type Split = {
  amount: number
  inputValue: string
  category: CategoryOption | undefined
}

type RowState = {
  splits: Split[]
  description: string
  file: unknown
}

enum Purpose {
  categorize = 'categorize',
  match = 'match',
}

export const SplitAndMatchForm = ({
  bankTransaction,
}: SplitAndMatchFormProps) => {
  const anyMatch = hasMatch(bankTransaction)
  const [formType, setFormType] = useState(
    bankTransaction.category
      ? Purpose.categorize
      : anyMatch
      ? Purpose.match
      : Purpose.categorize,
  )

  return (
    <div className='Layer__bank-transaction-mobile-list-item__split-and-match-form'>
      {formType === Purpose.categorize && (
        <SplitForm bankTransaction={bankTransaction} />
      )}
      {formType === Purpose.match && (
        <TheMatchForm bankTransaction={bankTransaction} />
      )}
      {anyMatch && formType === Purpose.match ? (
        <TextButton onClick={() => setFormType(Purpose.categorize)}>
          or split transaction
        </TextButton>
      ) : null}
      {anyMatch && formType === Purpose.categorize ? (
        <TextButton onClick={() => setFormType(Purpose.match)}>
          or find match
        </TextButton>
      ) : null}
    </div>
  )
}

// @TODO - into utils?
const isAlreadyMatched = (bankTransaction?: BankTransaction) => {
  if (bankTransaction?.match) {
    const foundMatch = bankTransaction.suggested_matches?.find(
      x => x.details.id === bankTransaction?.match?.details.id,
    )
    return foundMatch?.id
  }

  return undefined
}

const TheMatchForm = ({
  bankTransaction,
}: {
  bankTransaction: BankTransaction
}) => {
  const { match: matchBankTransaction } = useBankTransactions()
  const [selectedMatchId, setSelectedMatchId] = useState<string | undefined>(
    isAlreadyMatched(bankTransaction),
  )
  const [formError, setFormError] = useState<string | undefined>()
  const [showRetry, setShowRetry] = useState(false)

  useEffect(() => {
    if (bankTransaction.error) {
      setShowRetry(true)
    }
  }, [bankTransaction.error])

  const onMatchSubmit = async (matchId: string) => {
    const foundMatch = bankTransaction.suggested_matches?.find(
      x => x.id === matchId,
    )
    if (!foundMatch) {
      return
    }

    await matchBankTransaction(bankTransaction.id, foundMatch.id)
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
      {!showRetry && (
        <Button fullWidth={true} disabled={!selectedMatchId} onClick={save}>
          Approve match
        </Button>
      )}
      {showRetry ? (
        <RetryButton
          onClick={() => {
            if (!bankTransaction.processing) {
              save()
            }
          }}
          fullWidth={true}
          className='Layer__bank-transaction__retry-btn'
          processing={bankTransaction.processing}
          error={'Approval failed. Check connection and retry in few seconds.'}
        >
          Retry
        </RetryButton>
      ) : null}

      {formError && <ErrorText>{formError}</ErrorText>}
      {bankTransaction.error && showRetry ? (
        <ErrorText>
          Approval failed. Check connection and retry in few seconds.
        </ErrorText>
      ) : null}
    </div>
  )
}

const SplitForm = ({
  bankTransaction,
}: {
  bankTransaction: BankTransaction
}) => {
  const {
    categorize: categorizeBankTransaction,
    isLoading,
    error,
  } = useBankTransactions()
  const defaultCategory =
    bankTransaction.category ||
    (hasSuggestions(bankTransaction.categorization_flow) &&
      bankTransaction.categorization_flow?.suggestions?.[0])

  const [rowState, updateRowState] = useState<RowState>({
    splits: bankTransaction.category?.entries
      ? bankTransaction.category?.entries.map(c => {
          return {
            amount: c.amount || 0,
            inputValue: formatMoney(c.amount),
            category: mapCategoryToOption(c.category),
          }
        })
      : [
          {
            amount: bankTransaction.amount,
            inputValue: formatMoney(bankTransaction.amount),
            category: mapCategoryToOption(defaultCategory),
          },
          {
            amount: 0,
            inputValue: '0',
            category: mapCategoryToOption(defaultCategory),
          },
        ],
    description: '',
    file: undefined,
  })
  const [formError, setFormError] = useState<string | undefined>()
  const [showRetry, setShowRetry] = useState(false)

  useEffect(() => {
    if (bankTransaction.error) {
      setShowRetry(true)
    }
  }, [bankTransaction.error])

  const removeSplit = (index: number) => {
    const newSplits = rowState.splits.filter((_v, idx) => idx !== index)
    const splitTotal = newSplits.reduce((sum, split, index) => {
      const amount = index === 0 ? 0 : split.amount
      return sum + amount
    }, 0)
    const remaining = bankTransaction.amount - splitTotal
    newSplits[0].amount = remaining
    newSplits[0].inputValue = formatMoney(remaining)

    updateRowState({
      ...rowState,
      splits: newSplits,
    })
    setFormError(undefined)
  }

  const updateAmounts =
    (rowNumber: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const newAmount = parseMoney(event.target.value) || 0
      const newDisplaying = event.target.value
      const splitTotal = rowState.splits.reduce((sum, split, index) => {
        const amount =
          index === 0 ? 0 : index === rowNumber ? newAmount : split.amount
        return sum + amount
      }, 0)
      const remaining = bankTransaction.amount - splitTotal
      rowState.splits[rowNumber].amount = newAmount
      rowState.splits[rowNumber].inputValue = newDisplaying
      rowState.splits[0].amount = remaining
      rowState.splits[0].inputValue = formatMoney(remaining)
      updateRowState({ ...rowState })
      setFormError(undefined)
    }

  const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.target.value === '') {
      const [_, index] = event.target.name.split('-')
      rowState.splits[parseInt(index)].inputValue = '0.00'
      updateRowState({ ...rowState })
      setFormError(undefined)
    }
  }

  const changeCategory = (index: number, newValue: CategoryOption) => {
    rowState.splits[index].category = newValue
    updateRowState({ ...rowState })
    setFormError(undefined)
  }

  const addSplit = () => {
    updateRowState({
      ...rowState,
      splits: [
        ...rowState.splits,
        {
          amount: 0,
          inputValue: '0.00',
          category: mapCategoryToOption(defaultCategory),
        },
      ],
    })
    setFormError(undefined)
  }

  const validateSplit = (splitData: RowState) => {
    let valid = true

    splitData.splits.forEach(split => {
      if (split.amount <= 0) {
        valid = false
      } else if (!split.category) {
        valid = false
      }
    })

    return valid
  }

  const save = async () => {
    if (!validateSplit(rowState)) {
      if (rowState.splits.length > 1) {
        setFormError(
          'Use only positive amounts and select category for each entry',
        )
      } else {
        setFormError('Category is required')
      }
      return
    }

    await categorizeBankTransaction(
      bankTransaction.id,
      rowState.splits.length === 1
        ? ({
            type: 'Category',
            category: {
              type: 'StableName',
              stable_name: rowState?.splits[0].category?.payload.stable_name,
            },
          } as SingleCategoryUpdate)
        : ({
            type: 'Split',
            entries: rowState.splits.map(split => ({
              category: split.category?.payload.stable_name,
              amount: split.amount,
            })),
          } as SplitCategoryUpdate),
    )
  }

  return (
    <div>
      <Text weight={TextWeight.bold} size={TextSize.sm}>
        Split transaction
      </Text>
      <div className={`bank-transactions__splits-inputs`}>
        {rowState.splits.map((split, index) => (
          <div
            className={`bank-transactions__table-cell--split-entry`}
            key={`split-${index}`}
          >
            <div
              className={`bank-transactions__table-cell--split-entry__right-col`}
            >
              <CategorySelect
                bankTransaction={bankTransaction}
                name={`category-${bankTransaction.id}`}
                value={split.category}
                onChange={value => changeCategory(index, value)}
                className='Layer__category-menu--full'
                disabled={bankTransaction.processing}
              />
            </div>
            <Input
              type='text'
              name={`split-${index}`}
              disabled={index === 0}
              onChange={updateAmounts(index)}
              value={split.inputValue}
              onBlur={onBlur}
              isInvalid={split.amount < 0}
              errorMessage='Negative values are not allowed'
            />
            {index > 0 && (
              <Button
                className={`bank-transactions__table-cell--split-entry__merge-btn`}
                onClick={() => removeSplit(index)}
                rightIcon={<Trash size={12} />}
                variant={ButtonVariant.secondary}
                iconOnly={true}
              />
            )}
          </div>
        ))}
        <TextButton
          onClick={addSplit}
          disabled={rowState.splits.length > 5 || isLoading}
        >
          Add new split
        </TextButton>
      </div>
      {!showRetry && (
        <Button fullWidth={true} onClick={save} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      )}
      {showRetry ? (
        <RetryButton
          onClick={() => {
            if (!bankTransaction.processing) {
              save()
            }
          }}
          fullWidth={true}
          className='Layer__bank-transaction__retry-btn'
          processing={bankTransaction.processing}
          error={'Approval failed. Check connection and retry in few seconds.'}
        >
          Retry
        </RetryButton>
      ) : null}
      {formError && <ErrorText>{formError}</ErrorText>}
      {bankTransaction.error && showRetry ? (
        <ErrorText>
          Approval failed. Check connection and retry in few seconds.
        </ErrorText>
      ) : null}
    </div>
  )
}
