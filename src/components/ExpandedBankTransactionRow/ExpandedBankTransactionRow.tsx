import React, { useState, useEffect } from 'react'
import Layer from '../../api/layer'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import { useLayerContext } from '../../hooks/useLayerContext'
import Link from '../../icons/Link'
import Unlink from '../../icons/LinkBroken'
import {
  centsToDollars as formatMoney,
  dollarsToCents as parseMoney,
} from '../../models/Money'
import { BankTransaction, Category } from '../../types'
import { CategoryMenu } from '../CategoryMenu'
import { RadioButtonGroup } from '../RadioButtonGroup'

type Props = {
  bankTransaction: BankTransaction
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

export const ExpandedBankTransactionRow = ({ bankTransaction }: Props) => {
  const {
    auth: { access_token },
    businessId,
  } = useLayerContext()
  const { mutateOne: updateBankTransaction } = useBankTransactions()
  const [purpose, setPurpose] = useState<Purpose>(Purpose.categorize)

  const defaultCategory = !!bankTransaction.categorization_flow.suggestions
    ? bankTransaction.categorization_flow?.suggestions?.[0]
    : bankTransaction.category
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
      const newAmount = parseMoney(event?.target?.value) || 0
      const newDisplaying = event?.target?.value
      const splitTotal = rowState.splits
        .slice(0, -1)
        .reduce((sum, split, index) => {
          // If the index is the rowNumber, this is the entry we're editing.
          // So, use the value from the event.
          const amount = index === rowNumber ? newAmount : split.amount
          return sum + amount
        }, 0)
      const remaining = bankTransaction.amount - splitTotal
      if (rowState.splits[rowNumber]) {
        rowState.splits[rowNumber].amount = newAmount
        rowState.splits[rowNumber].inputValue = newDisplaying
      }
      rowState.splits[rowState.splits.length - 1].amount = remaining
      rowState.splits[rowState.splits.length - 1].inputValue =
        formatMoney(remaining)
      updateRowState({ ...rowState })
    }
  const refreshAmounts = () => updateAmounts(-1)()

  useEffect(() => {
    refreshAmounts()
  }, [rowState.splits.length])

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

  const changeCategory = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const [_, index] = event.target.name.split('-')
    rowState.splits[parseInt(index)].category_name = event.target.value
    updateRowState({ ...rowState })
  }

  const save = () => {
    const payload =
      rowState.splits.length === 1
        ? {
            type: 'Category',
            category: {
              type: 'StableName',
              stable_name: rowState?.splits[0].category_name,
            },
          }
        : {
            type: 'Split',
            entries: rowState.splits.map(split => ({
              category: split.category.category,
              amount: split.amount,
            })),
          }

    Layer.categorizeBankTransaction(access_token, {
      params: { businessId, bankTransactionId: bankTransaction.id },
      body: payload,
    }).then(({ data, error }) => {
      if (error) {
      }
      if (data) {
        updateBankTransaction(data)
      }
    })
  }

  const className = 'Layer__expanded-bank-transaction-row'
  return (
    <div className={className}>
      <div className={`${className}__purpose-button`}>
        <RadioButtonGroup
          name="purpose"
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
                defaultValue={defaultCategory}
                onChange={changeCategory}
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
