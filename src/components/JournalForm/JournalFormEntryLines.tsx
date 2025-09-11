import { useContext, useMemo } from 'react'
import { JournalContext } from '../../contexts/JournalContext'
import Trash from '../../icons/Trash'
import { LedgerAccountBalance } from '../../types/chart_of_accounts'
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
import { JournalEntryLineItem } from '../../types/journal'
import { LedgerEntryDirection } from '../../schemas/generalLedger/ledgerAccount'

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
  entrylineItems: JournalEntryLineItem[]
  addEntryLine: (direction: LedgerEntryDirection) => void
  removeEntryLine: (index: number) => void
  changeFormData: (
    name: string,
    value: string | BaseSelectOption | number | undefined,
    lineItemIndex: number,
    accounts?: LedgerAccountBalance[],
  ) => void
  sendingForm: boolean
  config: JournalConfig
}) => {
  const { data: categories } = useCategories({ mode: 'ALL' })
  const { form } = useContext(JournalContext)

  const { flattenedCategories, parentOptions } = useMemo(() => {
    const flattenedCategories = recursiveFlattenCategories(categories ?? [])

    const parentOptions = [...flattenedCategories]
      .sort((a, b) => (a.display_name.localeCompare(b.display_name)))
      .map((account) => {
        switch (account.type) {
          case 'AccountNested':
            return {
              label: `${account.display_name}`,
              value: account.id,
            }
          case 'OptionalAccountNested':
            return {
              label: account.display_name,
              value: account.stable_name,
            }
          case 'ExclusionNested':
            return {
              label: account.display_name,
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
          return category.stable_name === value.value
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

    const baseFields = relevantCategory.type === 'OptionalAccountNested'
      ? {
        id: relevantCategory.stable_name,
        stable_name: relevantCategory.stable_name,
        account_type: {
          value: relevantCategory.stable_name,
          display_name: relevantCategory.display_name,
        },
      }
      : {
        id: relevantCategory.id,
        stable_name: ('stable_name' in relevantCategory) ? relevantCategory.stable_name ?? '' : '',
        account_type: {
          value: relevantCategory.id,
          display_name: relevantCategory.display_name,
        },
      }

    return changeFormData(
      'parent',
      value,
      lineItemIndex,
      [
        {
          ...baseFields,
          is_deletable: false,
          name: relevantCategory.display_name,
          sub_accounts: [],
          balance: 0,
          normality: LedgerEntryDirection.Debit,
          // We aren't exposing account numbers for categories yet so this is safe
          account_number: null,
        },
      ],
    )
  }

  return (
    <>
      {['DEBIT', 'CREDIT'].map((direction, idx) => {
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
                        <Badge variant={item.direction === 'CREDIT'
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
                        value: item.account_identifier.id,
                        label: item.account_identifier.name,
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
                onClick={() => addEntryLine(direction as LedgerEntryDirection)}
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
