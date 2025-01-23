import { useContext, useMemo } from 'react'
import { JournalContext } from '../../contexts/JournalContext'
import Trash from '../../icons/Trash'
import { Direction, JournalEntryLineItem } from '../../types'
import { LedgerAccountBalance } from '../../types/chart_of_accounts'
import { BaseSelectOption } from '../../types/general'
import {
  convertCurrencyToNumber,
  convertNumberToCurrency,
  humanizeEnum,
} from '../../utils/format'
import { BadgeVariant } from '../Badge'
import { IconButton, TextButton } from '../Button'
import { InputWithBadge, InputGroup, Select } from '../Input'
import { JournalConfig } from '../Journal/Journal'
import { Text, TextSize } from '../Typography'
import { useAllCategories } from '../../hooks/categories/useAllCategories'
import { safeAssertUnreachable } from '../../utils/switch/safeAssertUnreachable'

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
  addEntryLine: (direction: Direction) => void
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
  const { data } = useAllCategories()
  const { form } = useContext(JournalContext)

  const { flattenedCategories, parentOptions } = useMemo(() => {
    const flattenedCategories = recursiveFlattenCategories(data ?? [])

    const parentOptions = [...flattenedCategories]
      .sort((a, b) => (a.display_name.localeCompare(b.display_name)))
      .map((account) => {
        switch (account.type) {
          case 'AccountNested':
            return {
              label: account.display_name,
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
            safeAssertUnreachable(account, 'Unexpected account type')
        }
      })

    return { flattenedCategories, parentOptions }
  }, [data])

  const handleChangeParent = ({
    lineItemIndex,
    value,
  }: { lineItemIndex: number, value: BaseSelectOption }) => {
    const relevantCategory = flattenedCategories.find((x) => {
      switch (x.type) {
        case 'AccountNested':
          return x.id === value.value
        case 'OptionalAccountNested':
          return x.stable_name === value.value
        case 'ExclusionNested':
          return x.id === value.value
        default:
          safeAssertUnreachable(x, 'Unexpected account type')
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
          name: relevantCategory.display_name,
          sub_accounts: [],
          balance: 0,
          normality: Direction.DEBIT,
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
                    <InputWithBadge
                      name={direction}
                      placeholder='$0.00'
                      value={convertNumberToCurrency(item.amount)}
                      disabled={sendingForm}
                      badge={humanizeEnum(direction)}
                      variant={
                        item.direction === 'CREDIT'
                          ? BadgeVariant.SUCCESS
                          : BadgeVariant.WARNING
                      }
                      onChange={e =>
                        changeFormData(
                          'amount',
                          convertCurrencyToNumber(
                            (e.target as HTMLInputElement).value,
                          ),
                          idx,
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
                onClick={() => addEntryLine(direction as Direction)}
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
