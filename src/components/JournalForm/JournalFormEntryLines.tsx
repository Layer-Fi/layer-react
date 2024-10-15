import React, { useContext } from 'react'
import { ChartOfAccountsContext } from '../../contexts/ChartOfAccountsContext'
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
import { useParentOptions } from '../ChartOfAccountsForm/useParentOptions'
import { InputWithBadge, InputGroup, Select } from '../Input'
import { JournalConfig } from '../Journal/Journal'
import { Text, TextSize } from '../Typography'

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
    accounts?: LedgerAccountBalance[] | undefined,
  ) => void
  sendingForm: boolean
  config: JournalConfig
}) => {
  const { data: accountsData } = useContext(ChartOfAccountsContext)
  const { form } = useContext(JournalContext)

  const parentOptions = useParentOptions(accountsData)

  return (
    <>
      {Object.keys(Direction)
        .reverse()
        .map((direction, idx) => {
          return (
            <div
              key={'Layer__journal__form__input-group-' + idx}
              className='Layer__journal__form__input-group Layer__journal__form__input-group__border'
            >
              <Text
                className='Layer__journal__form__input-group__title'
                size={TextSize.lg}
              >
                Add {humanizeEnum(direction)} Account
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
                          )
                        }
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
                        onChange={sel =>
                          changeFormData(
                            'parent',
                            sel,
                            idx,
                            accountsData?.accounts,
                          )
                        }
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
              {(config.form.addEntryLinesLimit === undefined ||
                config.form.addEntryLinesLimit > entrylineItems?.length) && (
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
