import React, { useContext } from 'react'
import {
  convertCurrencyToNumber,
  convertNumberToCurrency,
  CURRENCY_INPUT_PATTERN,
} from '../../utils/format'
import { BadgeVariant } from '../Badge'
import {
  Button,
  ButtonVariant,
  RetryButton,
  SubmitButton,
  TextButton,
} from '../Button'
import { InputWithBadge, InputGroup, Select, DateInput } from '../Input'
import { JournalContext } from '../Journal/Journal'
import { Text, TextSize, TextWeight } from '../Typography'

export const JournalForm = () => {
  const {
    form,
    cancelForm,
    submitForm,
    sendingForm,
    apiError,
    changeFormData,
    addEntryLine,
  } = useContext(JournalContext)

  // const parentOptions = useParentOptions(data)

  return (
    <form
      className='Layer__form'
      onSubmit={e => {
        e.preventDefault()
        submitForm()
      }}
    >
      <div className='Layer__journal__sidebar__header'>
        <Text size={TextSize.lg} weight={TextWeight.bold} className='title'>
          Add New Entry
        </Text>
        <div className='actions'>
          <Button
            type='button'
            onClick={cancelForm}
            variant={ButtonVariant.secondary}
            disabled={sendingForm}
          >
            Cancel
          </Button>
          {apiError && (
            <RetryButton
              type='submit'
              processing={sendingForm}
              error={'Check connection and retry in few seconds.'}
              disabled={sendingForm}
            >
              Retry
            </RetryButton>
          )}
          {!apiError && (
            <SubmitButton
              type='submit'
              noIcon={true}
              active={true}
              disabled={sendingForm}
            >
              Save
            </SubmitButton>
          )}
        </div>
      </div>

      {apiError && (
        <Text
          size={TextSize.sm}
          className='Layer__journal__form__error-message'
        >
          {apiError}
        </Text>
      )}

      <div className='Layer__journal__form__input-group'>
        <InputGroup name='date' label='Date' inline={true}>
          <DateInput
            selected={form?.data.entry_at}
            onChange={(date: string) => changeFormData('entry_at', date)}
            dateFormat='MMMM d, yyyy'
            placeholderText='Select date'
          />
          <DateInput
            selected={form?.data.entry_at}
            onChange={(date: string) => changeFormData('entry_at', date)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption='Time'
            dateFormat='h:mm aa'
            placeholderText='Select time'
          />
        </InputGroup>
      </div>
      {form?.data.line_items.map((item, idx) => {
        const direction =
          item.direction.toLowerCase().charAt(0).toUpperCase() +
          item.direction.toLowerCase().slice(1)
        return (
          <div
            key={'Layer__journal__form__input-group-' + idx}
            className='Layer__journal__form__input-group Layer__journal__form__input-group__border'
          >
            <Text
              className='Layer__journal__form__input-group__title'
              size={TextSize.lg}
            >
              Add {direction} Account
            </Text>
            <InputGroup name='debit' label='Amount' inline={true}>
              <InputWithBadge
                name='debit'
                placeholder='$0.00'
                value={convertNumberToCurrency(item.amount)}
                disabled={sendingForm}
                badge={direction}
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
                  )
                }
              />
            </InputGroup>
            <InputGroup name='account-name' label='Account name' inline={true}>
              <Select
                options={[]}
                value={item.account_identifier.stable_name}
                onChange={sel => changeFormData('debitAccount', sel)}
              />
            </InputGroup>
            <TextButton
              className='Layer__journal__add-entry-line'
              onClick={() => addEntryLine(item.direction)}
            >
              Add next account
            </TextButton>
          </div>
        )
      })}
    </form>
  )
}
