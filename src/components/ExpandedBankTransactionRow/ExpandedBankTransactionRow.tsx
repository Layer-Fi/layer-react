import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import FolderPlus from '../../icons/FolderPlus'
import Link from '../../icons/Link'
import RefreshCcw from '../../icons/RefreshCcw'
import Scissors from '../../icons/Scissors'
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
import { hasSuggestions } from '../../types/categories'
import { MatchBadge } from '../BankTransactionRow/MatchBadge'
import { Button, SubmitButton, ButtonVariant } from '../Button'
import { CategoryMenu } from '../CategoryMenu'
import { InputGroup, Input, FileInput } from '../Input'
import { Textarea } from '../Textarea'
import { Toggle } from '../Toggle'
import { ToggleSize } from '../Toggle/Toggle'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'

const dateFormat = 'LLL d, yyyy'

type Props = {
  bankTransaction: BankTransaction
  close?: () => void
  isOpen?: boolean
  asListItem?: boolean
  submitBtnText?: string
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

const hasMatch = (bankTransaction?: BankTransaction) => {
  return Boolean(
    (bankTransaction?.suggested_matches &&
      bankTransaction?.suggested_matches?.length > 0) ||
      bankTransaction?.match,
  )
}

const isAlreadyMatched = (bankTransaction?: BankTransaction) => {
  if (bankTransaction?.match) {
    const foundMatch = bankTransaction.suggested_matches?.find(
      x => x.details.id === bankTransaction?.match?.details.id,
    )
    return foundMatch?.id
  }

  return undefined
}

export const ExpandedBankTransactionRow = forwardRef<SaveHandle, Props>(
  (
    {
      bankTransaction,
      isOpen = false,
      asListItem = false,
      submitBtnText = 'Save',
    },
    ref,
  ) => {
    const {
      categorize: categorizeBankTransaction,
      match: matchBankTransaction,
    } = useBankTransactions()
    const [purpose, setPurpose] = useState<Purpose>(
      hasMatch(bankTransaction) ? Purpose.match : Purpose.categorize,
    )
    const [selectedMatchId, setSelectedMatchId] = useState<string | undefined>(
      isAlreadyMatched(bankTransaction),
    )

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
              category: c.category,
            }
          })
        : [
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

    const save = () => {
      if (purpose === Purpose.match) {
        if (
          selectedMatchId &&
          selectedMatchId !== isAlreadyMatched(bankTransaction)
        ) {
          onMatchSubmit(selectedMatchId)
        }
        return
      }

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
    }

    // Call this save action after clicking save in parent component:
    useImperativeHandle(ref, () => ({
      save,
    }))

    const onMatchSubmit = (matchId: string) => {
      const foundMatch = bankTransaction.suggested_matches?.find(
        x => x.id === matchId,
      )
      if (!foundMatch) {
        return
      }

      matchBankTransaction(bankTransaction.id, foundMatch.id)
    }

    const className = 'Layer__expanded-bank-transaction-row'
    return (
      <span
        className={`${className} ${className}--${
          isOpen ? 'expanded' : 'collapsed'
        }`}
      >
        <span className={`${className}__wrapper`}>
          <div className={`${className}__content-toggle`}>
            <Toggle
              name={`purpose-${bankTransaction.id}${asListItem ? '-li' : ''}`}
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
                  leftIcon: <RefreshCcw size={15} />,
                  disabled: !hasMatch(bankTransaction),
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
            <div className={`${className}__content-panels`}>
              <div
                className={classNames(
                  `${className}__match`,
                  `${className}__content-panel`,
                  purpose === Purpose.match
                    ? `${className}__content-panel--active`
                    : '',
                )}
              >
                <div className={`${className}__content-panel-container`}>
                  <table className={`Layer__table ${className}__match-table`}>
                    <thead>
                      <tr>
                        <th className='Layer__table-header'>Date</th>
                        <th className='Layer__table-header'>Description</th>
                        <th
                          className={`Layer__table-header ${className}__match-table__amount`}
                        >
                          Amount
                        </th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {bankTransaction.suggested_matches?.map((match, idx) => {
                        return (
                          <tr
                            key={idx}
                            className={classNames(
                              `${className}__match-row`,
                              match.id === selectedMatchId
                                ? `${className}__match-row--selected`
                                : '',
                            )}
                            onClick={() => {
                              if (selectedMatchId === match.id) {
                                setSelectedMatchId(undefined)
                                return
                              }
                              setSelectedMatchId(match.id)
                            }}
                          >
                            <td className='Layer__table-cell Layer__nowrap'>
                              {formatTime(
                                parseISO(match.details.date),
                                dateFormat,
                              )}
                            </td>
                            <td className='Layer__table-cell'>
                              {match.details.description}
                            </td>
                            <td
                              className={`Layer__table-cell ${className}__match-table__amount`}
                            >
                              ${formatMoney(match.details.amount)}
                            </td>
                            <td className={`${className}__match-table__status`}>
                              {match.details.id ===
                                bankTransaction.match?.details.id && (
                                <MatchBadge
                                  classNamePrefix={className}
                                  bankTransaction={bankTransaction}
                                  dateFormat={dateFormat}
                                  text='Matched'
                                />
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div
                className={classNames(
                  `${className}__splits`,
                  `${className}__content-panel`,
                  purpose === Purpose.categorize
                    ? `${className}__content-panel--active`
                    : '',
                )}
              >
                <div className={`${className}__content-panel-container`}>
                  <div className={`${className}__splits-inputs`}>
                    {rowState.splits.map((split, index) => (
                      <div
                        className={`${className}__table-cell--split-entry`}
                        key={`split-${index}`}
                      >
                        <Input
                          type='text'
                          name={`split-${index}${asListItem ? '-li' : ''}`}
                          disabled={index === 0}
                          onChange={updateAmounts(index)}
                          value={split.inputValue}
                          onBlur={onBlur}
                          className={`${className}__split-amount${
                            split.amount < 0 ? '--negative' : ''
                          }`}
                        />
                        <CategoryMenu
                          bankTransaction={bankTransaction}
                          name={`category-${index}${asListItem ? '-li' : ''}`}
                          value={split.category}
                          onChange={value => changeCategory(index, value)}
                          className='Layer__category-menu--full'
                        />
                        {index > 0 && (
                          <Button
                            onClick={() => removeSplit(index)}
                            leftIcon={<Link size={14} />}
                            variant={ButtonVariant.secondary}
                          >
                            Merge
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className={`${className}__splits-buttons`}>
                    <Button
                      onClick={addSplit}
                      leftIcon={<Scissors size={14} />}
                      variant={ButtonVariant.secondary}
                      disabled={rowState.splits.length > 5}
                    >
                      Split
                    </Button>
                  </div>
                </div>
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

            {asListItem ? (
              <div className={`${className}__submit-btn`}>
                <SubmitButton
                  onClick={() => {
                    if (!bankTransaction.processing) {
                      save()
                    }
                  }}
                  className='Layer__bank-transaction__submit-btn'
                  processing={bankTransaction.processing}
                  error={bankTransaction.error}
                  active={true}
                >
                  {submitBtnText}
                </SubmitButton>
              </div>
            ) : null}
          </div>
        </span>
      </span>
    )
  },
)
