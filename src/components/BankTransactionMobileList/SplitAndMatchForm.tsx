import React, { useState } from 'react'
import {
  centsToDollars as formatMoney,
  dollarsToCents as parseMoney,
} from '../../models/Money'
import { BankTransaction } from '../../types'
import { hasSuggestions } from '../../types/categories'
import { hasMatch } from '../../utils/bankTransactions'
import { Button, TextButton } from '../Button'
import { CategorySelect } from '../CategorySelect'
import {
  CategoryOption,
  mapCategoryToOption,
} from '../CategorySelect/CategorySelect'
import { InputGroup, Input, FileInput } from '../Input'
import { MatchForm } from '../MatchForm'
import { Text, TextSize, TextWeight } from '../Typography'

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
  const [selectedMatchId, setSelectedMatchId] = useState<string | undefined>(
    isAlreadyMatched(bankTransaction),
  )

  // @TODO - use different classNAmePrefix
  return (
    <div>
      <MatchForm
        classNamePrefix={'Layer__expanded-bank-transaction-row'}
        bankTransaction={bankTransaction}
        selectedMatchId={selectedMatchId}
        setSelectedMatchId={id => {
          // setMatchFormError(undefined)
          setSelectedMatchId(id)
        }}
        // matchFormError={matchFormError}
      />
      <Button
        fullWidth={true}
        disabled={!selectedMatchId}
        onClick={() => console.log('Save match')}
      >
        Approve match
      </Button>
    </div>
  )
}

const SplitForm = ({
  bankTransaction,
}: {
  bankTransaction: BankTransaction
}) => {
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
        ],
    description: '',
    file: undefined,
  })

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
      // setSplitFormError(undefined)
    }

  const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.target.value === '') {
      const [_, index] = event.target.name.split('-')
      rowState.splits[parseInt(index)].inputValue = '0.00'
      updateRowState({ ...rowState })
      // setSplitFormError(undefined)
    }
  }

  const changeCategory = (index: number, newValue: CategoryOption) => {
    rowState.splits[index].category = newValue
    updateRowState({ ...rowState })
    // setSplitFormError(undefined)
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
    // setSplitFormError(undefined)
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
              {/* {index > 0 && (
                              <Button
                                className={`bank-transactions__table-cell--split-entry__merge-btn`}
                                onClick={() => removeSplit(index)}
                                rightIcon={<Trash size={18} />}
                                variant={ButtonVariant.secondary}
                                iconOnly={true}
                              />
                            )} */}
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
          </div>
        ))}
        <TextButton onClick={addSplit} disabled={rowState.splits.length > 5}>
          Add new split
        </TextButton>
      </div>
      <Button fullWidth={true} onClick={() => console.log('Save split')}>
        Save
      </Button>
    </div>
  )
}
