import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useEffect,
  useRef,
  TransitionEvent,
} from 'react'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import Link from '../../icons/Link'
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
import { Button, SubmitButton, ButtonVariant, TextButton } from '../Button'
import { CategoryMenu } from '../CategoryMenu'
import { InputGroup, Input, FileInput } from '../Input'
import { MatchForm } from '../MatchForm'
import { Textarea } from '../Textarea'
import { Toggle } from '../Toggle'
import { ToggleSize } from '../Toggle/Toggle'
import { Text } from '../Typography'
import { TextSize } from '../Typography/Text'
import classNames from 'classnames'

type Props = {
  bankTransaction: BankTransaction
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
      bankTransaction.category
        ? Purpose.categorize
        : hasMatch(bankTransaction)
        ? Purpose.match
        : Purpose.categorize,
    )
    const [selectedMatchId, setSelectedMatchId] = useState<string | undefined>(
      isAlreadyMatched(bankTransaction),
    )
    const [height, setHeight] = useState<string | number>(0)
    const [isOver, setOver] = useState(false)
    const bodyRef = useRef<HTMLSpanElement>(null)
    const [isLoaded, setIsLoaded] = useState(false)

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

    const getDivHeight = useCallback(() => {
      const { height } = bodyRef.current
        ? bodyRef.current.getBoundingClientRect()
        : { height: undefined }

      return height || 0
    }, [])

    const handleTransitionEnd = useCallback(
      (e: TransitionEvent<HTMLSpanElement>) => {
        if (e.propertyName === 'height') {
          setHeight(isOpen ? 'auto' : 0)
          if (!isOpen) {
            setOver(true)
          }
        }
      },
      [isOpen],
    )

    useEffect(() => {
      if (!isLoaded) {
        return
      }

      setHeight(getDivHeight())
      setOver(false)

      if (!isOpen) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setHeight(0))
        })
      }
    }, [getDivHeight, isOpen])

    useEffect(() => {
      setIsLoaded(true)
      setOver(true)
    }, [])

    const className = 'Layer__expanded-bank-transaction-row'
    const shouldHide = !isOpen && isOver

    return (
      <span
        className={`${className} ${className}--${
          isOpen ? 'expanded' : 'collapsed'
        }`}
        style={{ height }}
        onTransitionEnd={handleTransitionEnd}
      >
        {shouldHide ? null : (
          <span className={`${className}__wrapper`} ref={bodyRef}>
            <div className={`${className}__content-toggle`}>
              <Toggle
                name={`purpose-${bankTransaction.id}${asListItem ? '-li' : ''}`}
                size={ToggleSize.small}
                options={[
                  {
                    value: 'categorize',
                    label: 'Categorize',
                  },
                  {
                    value: 'match',
                    label: 'Match',
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
                    <MatchForm
                      classNamePrefix={className}
                      bankTransaction={bankTransaction}
                      selectedMatchId={selectedMatchId}
                      setSelectedMatchId={setSelectedMatchId}
                    />
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
                            isInvalid={split.amount < 0}
                            errorMessage='Negative values are not allowed'
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
                              rightIcon={<Link size={14} />}
                              variant={ButtonVariant.secondary}
                            >
                              Merge
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className={`${className}__splits-buttons`}>
                      {rowState.splits.length > 1 ? (
                        <TextButton
                          onClick={addSplit}
                          disabled={rowState.splits.length > 5}
                        >
                          Add new split
                        </TextButton>
                      ) : (
                        <Button
                          onClick={addSplit}
                          rightIcon={<Scissors size={14} />}
                          variant={ButtonVariant.secondary}
                          disabled={rowState.splits.length > 5}
                        >
                          Split
                        </Button>
                      )}
                    </div>
                    {rowState.splits.length > 1 && (
                      <Text
                        size={TextSize.sm}
                        className={`${className}__splits-total`}
                      >
                        Total: $
                        {formatMoney(
                          rowState.splits.reduce(
                            (x, { amount }) => x + amount,
                            0,
                          ),
                        )}
                      </Text>
                    )}
                  </div>
                </div>
              </div>

              <InputGroup
                className={`${className}__description`}
                name='description'
              >
                <Textarea name='description' placeholder='Add description' />
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
        )}
      </span>
    )
  },
)
