import { useContext, useMemo } from 'react'
import { JournalContext } from '../../contexts/JournalContext'
import Trash from '../../icons/Trash'
import { BaseSelectOption } from '../../types/general'
import {
  humanizeEnum,
} from '../../utils/format'
import { IconButton, TextButton } from '../Button'
import { InputGroup, Select } from '../Input'
import { JournalConfig } from '../Journal/Journal'
import { Text, TextSize } from '../Typography'
import { useCategories } from '../../hooks/categories/useCategories'
import { unsafeAssertUnreachable } from '../../utils/switch/assertUnreachable'
import { AmountInput } from '../Input/AmountInput'
import { Badge, BadgeVariant } from '../Badge/Badge'
import { LedgerAccountSubtype, LedgerAccountType, LedgerEntryDirection, NestedLedgerAccount } from '../../schemas/generalLedger/ledgerAccount'
import { CreateCustomJournalEntryLineItem } from '../../schemas/generalLedger/customJournalEntry'

type WithSubCategories = { subCategories: ReadonlyArray<WithSubCategories> | null }

function recursiveFlattenCategories<T extends WithSubCategories>(
  accounts: ReadonlyArray<T>,
): ReadonlyArray<T> {
  const flattenedResult = accounts.flatMap(a => [
    a,
    recursiveFlattenCategories((a.subCategories ?? [])),
  ]).flat()

  return flattenedResult as ReadonlyArray<T>
}

export const JournalFormEntryLines = ({
  entrylineItems,
  addEntryLine,
  removeEntryLine,
  changeFormData,
  sendingForm,
  config,
}: {
  entrylineItems: CreateCustomJournalEntryLineItem[]
  addEntryLine: (direction: LedgerEntryDirection) => void
  removeEntryLine: (index: number) => void
  changeFormData: (
    name: string,
    value: string | BaseSelectOption | number | undefined,
    lineItemIndex: number,
    accounts?: NestedLedgerAccount[],
  ) => void
  sendingForm: boolean
  config: JournalConfig
}) => {
  const { data: categories } = useCategories({ mode: 'ALL' })
  const { form } = useContext(JournalContext)

  const { flattenedCategories, parentOptions } = useMemo(() => {
    const flattenedCategories = recursiveFlattenCategories(categories ?? [])

    const parentOptions = [...flattenedCategories]
      .sort((a, b) => (a.displayName.localeCompare(b.displayName)))
      .map((account) => {
        switch (account.type) {
          case 'AccountNested':
            return {
              label: account.displayName,
              value: account.id,
            }
          case 'OptionalAccountNested':
            return {
              label: account.displayName,
              value: account.stableName,
            }
          case 'ExclusionNested':
            return {
              label: account.displayName,
              value: account.id,
            }
          default:
            unsafeAssertUnreachable({
              value: account,
              message: 'Unexpected account type',
            })
        }
      })

    return { flattenedCategories, parentOptions }
  }, [categories])

  const handleChangeParent = ({
    lineItemIndex,
    value,
  }: { lineItemIndex: number, value: BaseSelectOption }) => {
    const relevantCategory = flattenedCategories.find((category) => {
      switch (category.type) {
        case 'AccountNested':
          return category.id === value.value
        case 'OptionalAccountNested':
          return category.stableName === value.value
        case 'ExclusionNested':
          return category.id === value.value
        default:
          unsafeAssertUnreachable({
            value: category,
            message: 'Unexpected account type',
          })
      }
    })

    if (!relevantCategory) {
      return
    }

    const baseFields = (() => {
      switch (relevantCategory.type) {
        case 'AccountNested':
          return {
            id: relevantCategory.id,
            stableName: relevantCategory.stableName || '',
            accountType: {
              value: LedgerAccountType.Asset,
              displayName: relevantCategory.displayName,
            },
            accountSubtype: {
              value: LedgerAccountSubtype.FixedAsset,
              displayName: relevantCategory.displayName,
            },
          }
        case 'OptionalAccountNested':
          return {
            id: relevantCategory.stableName,
            stableName: relevantCategory.stableName,
            accountType: {
              value: LedgerAccountType.Asset,
              displayName: relevantCategory.displayName,
            },
            accountSubtype: {
              value: LedgerAccountSubtype.FixedAsset,
              displayName: relevantCategory.displayName,
            },
          }
        case 'ExclusionNested':
          return {
            id: relevantCategory.id,
            stableName: '',
            accountType: {
              value: LedgerAccountType.Asset,
              displayName: relevantCategory.displayName,
            },
            accountSubtype: {
              value: LedgerAccountSubtype.FixedAsset,
              displayName: relevantCategory.displayName,
            },
          }
        default:
          unsafeAssertUnreachable({
            value: relevantCategory,
            message: 'Unexpected account type',
          })
      }
    })()

    return changeFormData(
      'parent',
      value,
      lineItemIndex,
      [
        {
          ...baseFields,
          isDeletable: false,
          name: relevantCategory.displayName,
          subAccounts: [],
          balance: 0,
          normality: LedgerEntryDirection.Debit,
        },
      ],
    )
  }

  return (
    <>
      {[LedgerEntryDirection.Debit, LedgerEntryDirection.Credit].map((direction, idx) => {
        return (
          <div
            key={'Layer__journal__form__input-group-' + idx}
            className='Layer__journal__form__input-group Layer__journal__form__input-group__border'
          >
            <Text
              className='Layer__journal__form__input-group__title'
              size={TextSize.lg}
            >
              Add
              {' '}
              {humanizeEnum(direction)}
              {' '}
              Account
            </Text>
            {entrylineItems?.map((item, idx) => {
              if (item.direction !== direction) {
                return null
              }
              return (
                <div
                  className='Layer__journal__form__input-group__line-item'
                  key={direction + '-' + idx}
                >
                  <InputGroup name={direction} label='Amount' inline={true}>
                    <AmountInput
                      name={direction}
                      onChange={value => changeFormData('amount', value, idx)}
                      value={item.amount}
                      disabled={sendingForm}
                      allowNegativeValue={false}
                      badge={(
                        <Badge variant={item.direction === LedgerEntryDirection.Credit
                          ? BadgeVariant.SUCCESS
                          : BadgeVariant.WARNING}
                        >
                          {humanizeEnum(direction)}
                        </Badge>
                      )}
                      isInvalid={Boolean(
                        form?.errors?.lineItems.find(
                          x => x.id === idx && x.field === 'amount',
                        ),
                      )}
                      errorMessage={
                        form?.errors?.lineItems.find(
                          x => x.id === idx && x.field === 'amount',
                        )?.message
                      }
                    />
                  </InputGroup>
                  <InputGroup
                    name='account-name'
                    label='Account name'
                    inline={true}
                  >
                    <Select
                      options={parentOptions}
                      value={{
                        value: item.account.id,
                        label: item.account.name,
                      }}
                      onChange={value =>
                        handleChangeParent({
                          lineItemIndex: idx,
                          value,
                        })}
                      isInvalid={Boolean(
                        form?.errors?.lineItems.find(
                          x => x.id === idx && x.field === 'account',
                        ),
                      )}
                      errorMessage={
                        form?.errors?.lineItems.find(
                          x => x.id === idx && x.field === 'account',
                        )?.message
                      }
                    />
                    {idx >= 2 && (
                      <IconButton
                        className='Layer__remove__button'
                        onClick={() => removeEntryLine(idx)}
                        icon={<Trash />}
                      />
                    )}
                  </InputGroup>
                </div>
              )
            })}
            {(config.form.addEntryLinesLimit === undefined
              || config.form.addEntryLinesLimit > entrylineItems?.length) && (
              <TextButton
                className='Layer__journal__add-entry-line'
                onClick={() => addEntryLine(direction)}
              >
                Add next account
              </TextButton>
            )}
          </div>
        )
      })}
    </>
  )
}
