import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useEffect,
  useRef,
  TransitionEvent,
} from 'react'
import { Layer } from '../../api/layer'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import { useLayerContext } from '../../contexts/LayerContext'
import { useProfitAndLossLTM } from '../../hooks/useProfitAndLoss/useProfitAndLossLTM'
import AlertCircle from '../../icons/AlertCircle'
import Scissors from '../../icons/ScissorsFullOpen'
import Trash from '../../icons/Trash'
import {
  centsToDollars as formatMoney,
  dollarsToCents as parseMoney,
} from '../../models/Money'
import {
  BankTransaction,
  SplitCategoryUpdate,
  SingleCategoryUpdate,
} from '../../types'
import { hasSuggestions } from '../../types/categories'
import { getCategorizePayload, hasMatch } from '../../utils/bankTransactions'
import {
  BankTransactionsMode,
  categorizationEnabled,
} from '../BankTransactions/BankTransactions'
import { Button, SubmitButton, ButtonVariant, TextButton } from '../Button'
import { SubmitAction } from '../Button/SubmitButton'
import { CategorySelect } from '../CategorySelect'
import {
  CategoryOption,
  mapCategoryToOption,
} from '../CategorySelect/CategorySelect'
import { InputGroup, Input, FileInput } from '../Input'
import { MatchForm } from '../MatchForm'
import { Textarea } from '../Textarea'
import { Toggle } from '../Toggle'
import { ToggleSize } from '../Toggle/Toggle'
import { Text, ErrorText, TextSize } from '../Typography'
import { APIErrorNotifications } from './APIErrorNotifications'
import classNames from 'classnames'

type Props = {
  bankTransaction: BankTransaction
  isOpen?: boolean
  close: () => void
  asListItem?: boolean
  submitBtnText?: string
  mode: BankTransactionsMode
  containerWidth?: number
  categorized?: boolean
  showDescriptions: boolean
  showReceiptUploads: boolean
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

export type SaveHandle = {
  save: () => void
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

export const ExpandedBankTransactionRow = forwardRef<SaveHandle, Props>(
  (
    {
      bankTransaction,
      isOpen = false,
      close,
      categorized,
      asListItem = false,
      submitBtnText = 'Save',
      containerWidth,
      showDescriptions,
      mode,
      showReceiptUploads,
    },
    ref,
  ) => {
    const {
      categorize: categorizeBankTransaction,
      match: matchBankTransaction,
    } = useBankTransactionsContext()
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
    const [matchFormError, setMatchFormError] = useState<string | undefined>()
    const [splitFormError, setSplitFormError] = useState<string | undefined>()
    const [height, setHeight] = useState<string | number>(0)
    const [isOver, setOver] = useState(false)
    const bodyRef = useRef<HTMLSpanElement>(null)
    const [memoText, setMemoText] = useState<string | undefined>()
    const [receiptUrls, setReceiptUrls] = useState<string[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    const { auth, businessId, apiUrl } = useLayerContext()

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
      setSplitFormError(undefined)
    }

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
      setSplitFormError(undefined)
    }

    const sanitizeNumberInput = (input: string): string => {
      let sanitized = input.replace(/[^0-9.]/g, '')

      // Ensure there's at most one period
      const parts = sanitized.split('.')
      if (parts.length > 2) {
        sanitized = parts[0] + '.' + parts.slice(1).join('')
      }

      // Limit to two digits after the decimal point
      if (parts.length === 2) {
        sanitized = parts[0] + '.' + parts[1].slice(0, 2)
      }

      return sanitized
    }

    const updateAmounts =
      (rowNumber: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const newDisplaying = sanitizeNumberInput(event.target.value)

        const newAmount = Number(newDisplaying) * 100 // cents
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
        setSplitFormError(undefined)
      }

    const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      if (event.target.value === '') {
        const [_, index] = event.target.name.split('-')
        rowState.splits[parseInt(index)].inputValue = '0.00'
        updateRowState({ ...rowState })
        setSplitFormError(undefined)
      }
    }

    const onChangePurpose = (event: React.ChangeEvent<HTMLInputElement>) => {
      setPurpose(
        event.target.value === Purpose.match
          ? Purpose.match
          : Purpose.categorize,
      )
      setSplitFormError(undefined)
      setMatchFormError(undefined)
    }

    const changeCategory = (index: number, newValue: CategoryOption) => {
      rowState.splits[index].category = newValue
      updateRowState({ ...rowState })
      setSplitFormError(undefined)
    }

    const save = async () => {
      if (showDescriptions && memoText != undefined) {
        const result = await Layer.updateBankTransactionMetadata(
          apiUrl,
          auth.access_token,
          {
            params: {
              businessId: businessId,
              bankTransactionId: bankTransaction.id,
            },
            body: {
              memo: memoText,
            },
          },
        )
      }

      if (purpose === Purpose.match) {
        if (!selectedMatchId) {
          setMatchFormError('Select an option to match the transaction')
        } else if (
          selectedMatchId &&
          selectedMatchId !== isAlreadyMatched(bankTransaction)
        ) {
          onMatchSubmit(selectedMatchId)
        }
        return
      }

      if (!validateSplit(rowState)) {
        if (rowState.splits.length > 1) {
          setSplitFormError(
            'Use only positive amounts and select category for each entry',
          )
        } else {
          setSplitFormError('Category is required')
        }
        return
      }

      await categorizeBankTransaction(
        bankTransaction.id,
        rowState.splits.length === 1 && rowState?.splits[0].category
          ? ({
              type: 'Category',
              category: getCategorizePayload(rowState?.splits[0].category),
            } as SingleCategoryUpdate)
          : ({
              type: 'Split',
              entries: rowState.splits.map(split => ({
                category: split.category
                  ? getCategorizePayload(split.category)
                  : '',
                amount: split.amount,
              })),
            } as SplitCategoryUpdate),
      )
      close()
    }

    const fetchMetadata = async () => {
      const getBankTransactionMetadata = Layer.getBankTransactionMetadata(
        apiUrl,
        auth.access_token,
        {
          params: {
            businessId: businessId,
            bankTransactionId: bankTransaction.id,
          },
        },
      )
      const result = await getBankTransactionMetadata()
      if (result.data.memo) setMemoText(result.data.memo)
    }

    const fetchDocuments = async () => {
      const listBankTransactionDocuments = Layer.listBankTransactionDocuments(
        apiUrl,
        auth.access_token,
        {
          params: {
            businessId: businessId,
            bankTransactionId: bankTransaction.id,
          },
        },
      )
      const result = await listBankTransactionDocuments()
      const retrievedDocs = result.data.documentUrls.map(
        (docUrl: any) => docUrl.presignedUrl,
      )
      setReceiptUrls(retrievedDocs)
    }

    // Call this save action after clicking save in parent component:
    useImperativeHandle(ref, () => ({
      save,
    }))

    const onMatchSubmit = async (matchId: string) => {
      const foundMatch = bankTransaction.suggested_matches?.find(
        x => x.id === matchId,
      )
      if (!foundMatch) {
        return
      }

      await matchBankTransaction(bankTransaction.id, foundMatch.id)
      close()
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
      const loadDocumentsAndMetadata = async () => {
        if (showDescriptions) await fetchMetadata()
        if (showReceiptUploads) await fetchDocuments()
        setIsLoaded(true)
        setOver(true)
      }
      loadDocumentsAndMetadata()
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
            {categorizationEnabled(mode) ? (
              <div className={`${className}__content-toggle`}>
                <Toggle
                  name={`purpose-${bankTransaction.id}${
                    asListItem ? '-li' : ''
                  }`}
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
                      disabledMessage:
                        'We could not find matching transactions',
                    },
                  ]}
                  selected={purpose}
                  onChange={onChangePurpose}
                />
              </div>
            ) : (
              <></>
            )}
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
                      readOnly={!categorizationEnabled(mode)}
                      setSelectedMatchId={id => {
                        setMatchFormError(undefined)
                        setSelectedMatchId(id)
                      }}
                      matchFormError={matchFormError}
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
                            disabled={
                              index === 0 || !categorizationEnabled(mode)
                            }
                            onChange={updateAmounts(index)}
                            value={split.inputValue}
                            onBlur={onBlur}
                            isInvalid={split.amount < 0}
                            inputMode='numeric'
                            errorMessage='Negative values are not allowed'
                          />
                          <div
                            className={`${className}__table-cell--split-entry__right-col`}
                          >
                            <CategorySelect
                              bankTransaction={bankTransaction}
                              name={`category-${bankTransaction.id}`}
                              value={split.category}
                              onChange={value => changeCategory(index, value)}
                              className='Layer__category-menu--full'
                              disabled={
                                bankTransaction.processing ||
                                !categorizationEnabled(mode)
                              }
                              excludeMatches
                            />
                            {index > 0 && (
                              <Button
                                className={`${className}__table-cell--split-entry__merge-btn`}
                                onClick={() => removeSplit(index)}
                                rightIcon={<Trash size={18} />}
                                variant={ButtonVariant.secondary}
                                iconOnly={true}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {splitFormError && <ErrorText>{splitFormError}</ErrorText>}
                    <div className={`${className}__total-and-btns`}>
                      {rowState.splits.length > 1 && (
                        <Input
                          disabled={true}
                          leftText='Total'
                          inputMode='numeric'
                          value={`$${formatMoney(
                            rowState.splits.reduce(
                              (x, { amount }) => x + amount,
                              0,
                            ),
                          )}`}
                        />
                      )}
                      {categorizationEnabled(mode) ? (
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
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {showDescriptions && (
                <InputGroup
                  className={`${className}__description`}
                  name='description'
                >
                  <Textarea
                    name='description'
                    placeholder='Add description'
                    value={memoText}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setMemoText(e.target.value)
                    }
                  />
                </InputGroup>
              )}

              {showReceiptUploads && (
                <div>
                  <div className={`${className}__file-upload`}>
                    <FileInput
                      onUpload={async (file: File) => {
                        const uploadDocument =
                          Layer.uploadBankTransactionDocument(
                            apiUrl,
                            auth.access_token,
                          )
                        const result = await uploadDocument({
                          businessId: businessId,
                          bankTransactionId: bankTransaction.id,
                          file: file,
                          documentType: 'RECEIPT',
                        })
                        await fetchDocuments()
                      }}
                      text='Upload receipt'
                    />

                    {receiptUrls.length > 0 && 'Attached receipts:'}
                    {receiptUrls.map((url, index) => (
                      <a
                        key={url}
                        href={url}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        Receipt {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {asListItem && categorizationEnabled(mode) ? (
                <div className={`${className}__submit-btn`}>
                  {bankTransaction.error ? (
                    <Text
                      as='span'
                      size={TextSize.md}
                      className='Layer__unsaved-info'
                    >
                      <span>Unsaved</span>
                      <AlertCircle size={12} />
                    </Text>
                  ) : null}
                  <SubmitButton
                    onClick={() => {
                      if (!bankTransaction.processing) {
                        save()
                      }
                    }}
                    className='Layer__bank-transaction__submit-btn'
                    processing={bankTransaction.processing}
                    active={true}
                    action={
                      categorized ? SubmitAction.SAVE : SubmitAction.UPDATE
                    }
                  >
                    {submitBtnText}
                  </SubmitButton>
                </div>
              ) : null}
            </div>
            <APIErrorNotifications
              bankTransaction={bankTransaction}
              containerWidth={containerWidth}
            />
          </span>
        )}
      </span>
    )
  },
)
