import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import FolderPlus from '../../icons/FolderPlus'
import Link from '../../icons/Link'
import Unlink from '../../icons/LinkBroken'
import RefreshCcw from '../../icons/RefreshCcw'
import {
  centsToDollars as formatMoney,
  dollarsToCents as parseMoney,
} from '../../models/Money'
import {
  BankTransaction,
  SplitCategoryUpdate,
  SingleCategoryUpdate,
  Category,
  CategorizationType,
} from '../../types'
import { Button } from '../Button'
import { ButtonVariant } from '../Button/Button'
import { CategoryMenu } from '../CategoryMenu'
import { InputGroup, Input, FileInput } from '../Input'
import { Textarea } from '../Textarea'
import { Toggle } from '../Toggle'
import { ToggleSize } from '../Toggle/Toggle'

type Props = {
  bankTransaction: BankTransaction
  close?: () => void
  isOpen?: boolean
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

export type SaveHandle = {
  save: () => void
}

export const ExpandedBankTransactionRow = forwardRef<SaveHandle, Props>(
  ({ bankTransaction, isOpen = false }, ref) => {
    const { categorize: categorizeBankTransaction } = useBankTransactions()
    const [purpose, setPurpose] = useState<Purpose>(Purpose.categorize)

    const defaultCategory =
      bankTransaction.category ||
      (bankTransaction.categorization_flow?.type ===
        CategorizationType.ASK_FROM_SUGGESTIONS &&
        bankTransaction.categorization_flow?.suggestions?.[0])
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
        event.target.value === Purpose.match
          ? Purpose.match
          : Purpose.categorize,
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
                category:
                  split.category?.stable_name || split.category?.category,
                amount: split.amount,
              })),
            } as SplitCategoryUpdate),
      ).catch(e => console.error(e))

    // Call this save action after clicking save in parent component:
    useImperativeHandle(ref, () => ({
      save,
    }))

    const className = 'Layer__expanded-bank-transaction-row'
    return (
      <tr
        className={`${className} ${className}--${
          isOpen ? 'expanded' : 'collapsed'
        }`}
      >
        <td colSpan={5}>
          <span className={`${className}__wrapper`}>
            <div className={`${className}__content-toggle`}>
              <Toggle
                name={`purpose-${bankTransaction.id}`}
                size={ToggleSize.small}
                options={[
                  {
                    value: 'categorize',
                    label: 'Categorize',
                    leftIcon: <FolderPlus size={15} />,
                  },
                  {
                    value: 'match',
                    label: 'Match',
                    disabled: true,
                    leftIcon: <RefreshCcw size={15} />,
                  },
                ]}
                selected={purpose}
                onChange={onChangePurpose}
              />
            </div>
            <div
              className={`${className}__content`}
              id={`expanded-${bankTransaction.id}`}
            >
              <div className={`${className}__splits`}>
                <div className={`${className}__splits-inputs`}>
                  {rowState.splits.map((split, index) => (
                    <div
                      className={`${className}__table-cell--split-entry`}
                      key={`split-${index}`}
                    >
                      {rowState.splits.length > 1 && (
                        <Input
                          type='text'
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
                      <CategoryMenu
                        bankTransaction={bankTransaction}
                        name={`category-${index}`}
                        value={split.category}
                        onChange={value => changeCategory(index, value)}
                        className='Layer__category-menu--full'
                      />
                    </div>
                  ))}
                </div>
                <div className={`${className}__splits-buttons`}>
                  {rowState.splits.length === 1 ? (
                    <Button
                      onClick={addSplit}
                      leftIcon={<Unlink size={14} />}
                      variant={ButtonVariant.secondary}
                    >
                      Split
                    </Button>
                  ) : (
                    <Button
                      onClick={removeSplit}
                      leftIcon={<Link size={14} />}
                      variant={ButtonVariant.secondary}
                    >
                      Merge
                    </Button>
                  )}
                </div>
              </div>

              <InputGroup
                className={`${className}__description`}
                name='description'
                label='Description'
              >
                <Textarea name='description' placeholder='Enter description' />
              </InputGroup>

              <div className={`${className}__file-upload`}>
                <FileInput text='Upload receipt' />
              </div>
              {/* <div className={`${className}__table-cell`}>
              <button onClick={save} className={`${className}__button--save`}>
                Save
              </button>
            </div> */}
            </div>
          </span>
        </td>
      </tr>
    )
  },
)
