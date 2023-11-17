import React, { useState } from 'react'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import Link from '../../icons/Link'
import Unlink from '../../icons/LinkBroken'
import {
  centsToDollars as formatMoney,
  dollarsToCents as parseMoney,
} from '../../models/Money'
import {
  BankTransaction,
  SplitCategoryUpdate,
  SingleCategoryUpdate,
  Category,
} from '../../types'
import { CategoryMenu } from '../CategoryMenu'
import { RadioButtonGroup } from '../RadioButtonGroup'

type Props = {
  bankTransaction: BankTransaction
  close?: () => void
}

type Split = {
  amount: number
  inputValue: string
  category: Category | undefined
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

export const ExpandedBankTransactionRow = ({
  bankTransaction,
  close,
}: Props) => {
  const { categorize: categorizeBankTransaction } = useBankTransactions()
  const [purpose, setPurpose] = useState<Purpose>(Purpose.categorize)

  const defaultCategory =
    bankTransaction.category ||
    bankTransaction.categorization_flow?.suggestions?.[0]
  const [rowState, updateRowState] = useState<RowState>({
    splits: [
      {
        amount: bankTransaction.amount,
        inputValue: formatMoney(bankTransaction.amount),
        category: defaultCategory,
      },
    ],
    description: '',
    file: undefined,
  })

  const addSplit = () =>
    updateRowState({
      ...rowState,
      splits: [
        ...rowState.splits,
        { amount: 0, inputValue: '0.00', category: defaultCategory },
      ],
    })

  const removeSplit = () =>
    updateRowState({
      ...rowState,
      splits: rowState.splits.slice(0, -1),
    })

  const updateAmounts =
    (rowNumber: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const newAmount = parseMoney(event.target.value) || 0
      const newDisplaying = event.target.value
      const splitTotal = rowState.splits
        .slice(0, -1)
        .reduce((sum, split, index) => {
          const amount = index === rowNumber ? newAmount : split.amount
          return sum + amount
        }, 0)
      const remaining = bankTransaction.amount - splitTotal
      rowState.splits[rowNumber].amount = newAmount
      rowState.splits[rowNumber].inputValue = newDisplaying
      rowState.splits[rowState.splits.length - 1].amount = remaining
      rowState.splits[rowState.splits.length - 1].inputValue =
        formatMoney(remaining)
      updateRowState({ ...rowState })
    }

  const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.target.value === '') {
      const [_, index] = event.target.name.split('-')
      rowState.splits[parseInt(index)].inputValue = '0.00'
      updateRowState({ ...rowState })
    }
  }

  const onChangePurpose = (event: React.ChangeEvent<HTMLInputElement>) =>
    setPurpose(
      event.target.value === Purpose.match ? Purpose.match : Purpose.categorize,
    )

  const changeCategory = (index: number, newValue: Category) => {
    rowState.splits[index].category = newValue
    updateRowState({ ...rowState })
  }

  const save = () =>
    categorizeBankTransaction(
      bankTransaction.id,
      rowState.splits.length === 1
        ? ({
            type: 'Category',
            category: {
              type: 'StableName',
              stable_name:
                rowState?.splits[0].category?.stable_name ||
                rowState?.splits[0].category?.category,
            },
          } as SingleCategoryUpdate)
        : ({
            type: 'Split',
            entries: rowState.splits.map(split => ({
              category: split.category?.stable_name || split.category?.category,
              amount: split.amount,
            })),
          } as SplitCategoryUpdate),
    ).then(close)

  const className = 'Layer__expanded-bank-transaction-row'
  return (
    <div className={className}>
      <div className={`${className}__purpose-button`}>
        <RadioButtonGroup
          name={`purpose-${bankTransaction.id}`}
          size="small"
          buttons={[
            { value: 'categorize', label: 'Categorize' },
            { value: 'match', label: 'Match', disabled: true },
          ]}
          selected={purpose}
          onChange={onChangePurpose}
        />
      </div>
      <div
        className={`${className}__content`}
        id={`expanded-${bankTransaction.id}`}
      >
        <div
          className={`${className}__table-cell ${className}__table-cell--header`}
        ></div>
        <div
          className={`${className}__table-cell ${className}__table-cell--header`}
        >
          Category
        </div>
        <div
          className={`${className}__table-cell ${className}__table-cell--header`}
        >
          Description
        </div>
        <div
          className={`${className}__table-cell ${className}__table-cell--header`}
        >
          Receipt
        </div>
        <div
          className={`${className}__table-cell ${className}__table-cell--header`}
        ></div>
        <div
          className={`${className}__table-cell ${className}__table-cell--header`}
        ></div>

        <div className={`${className}__table-cell`}>
          {rowState.splits.length === 1 ? (
            <div className={`${className}__button--split`} onClick={addSplit}>
              <Unlink className={`${className}__svg`} size={18} />
              Split
            </div>
          ) : (
            <div
              className={`${className}__button--merge`}
              onClick={removeSplit}
            >
              <Link className={`${className}__svg`} size={18} />
              Merge
            </div>
          )}
        </div>
        <div className={`${className}__table-cell`}>
          {rowState.splits.map((split, index) => (
            <div
              className={`${className}__table-cell--split-entry`}
              key={`split-${index}`}
            >
              <CategoryMenu
                bankTransaction={bankTransaction}
                name={`category-${index}`}
                value={split.category}
                onChange={value => changeCategory(index, value)}
              />
              {rowState.splits.length > 1 && (
                <input
                  type="text"
                  name={`split-${index}`}
                  disabled={index + 1 === rowState.splits.length}
                  onChange={updateAmounts(index)}
                  value={split.inputValue}
                  onBlur={onBlur}
                  className={`${className}__split-amount${
                    split.amount < 0 ? '--negative' : ''
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div
          className={`${className}__table-cell ${className}__table-cell--description`}
        >
          <textarea></textarea>
        </div>
        <div className={`${className}__table-cell`}>
          <input type="file" />
        </div>
        <div className={`${className}__table-cell`}></div>
        <div className={`${className}__table-cell`}>
          <button onClick={save} className={`${className}__button--save`}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
