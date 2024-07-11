import React, { useContext } from 'react'
import { JournalContext } from '../../contexts/JournalContext'
import { Button, ButtonVariant, RetryButton, SubmitButton } from '../Button'
import { DatePicker } from '../DatePicker'
import { InputGroup } from '../Input'
import { JournalConfig } from '../Journal/Journal'
import { Textarea } from '../Textarea/Textarea'
import { Text, TextSize, TextWeight } from '../Typography'
import { JournalFormEntryLines } from './JournalFormEntryLines'

export const JournalForm = ({ config }: { config: JournalConfig }) => {
  const {
    form,
    cancelForm,
    submitForm,
    sendingForm,
    apiError,
    changeFormData,
    addEntryLine,
    removeEntryLine,
  } = useContext(JournalContext)

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
          <div className='Layer__journal__datepicker__wrapper'>
            <DatePicker
              selected={
                form?.data.entry_at ? new Date(form?.data.entry_at) : new Date()
              }
              onChange={date => {
                if (!Array.isArray(date)) {
                  changeFormData('entry_at', date.toISOString())
                }
              }}
              mode='dayPicker'
              placeholderText='Select date'
              currentDateOption={false}
            />
            <DatePicker
              selected={
                form?.data.entry_at ? new Date(form?.data.entry_at) : new Date()
              }
              onChange={date => {
                if (!Array.isArray(date)) {
                  changeFormData('entry_at', date.toISOString())
                }
              }}
              mode='timePicker'
              placeholderText='Select time'
              currentDateOption={false}
            />
          </div>
        </InputGroup>
      </div>
      <JournalFormEntryLines
        entrylineItems={form?.data.line_items || []}
        addEntryLine={addEntryLine}
        removeEntryLine={removeEntryLine}
        changeFormData={changeFormData}
        sendingForm={sendingForm}
        config={config}
      />
      <div className='Layer__journal__form__input-group Layer__journal__form__input-group__textarea'>
        <InputGroup name='memo' label='Notes'>
          <Textarea
            name='memo'
            placeholder='Add description'
            value={form?.data.memo}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              changeFormData('memo', e.target.value)
            }
            disabled={sendingForm}
          />
        </InputGroup>
      </div>
      <div className='Layer__journal__bottom-actions'>
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
    </form>
  )
}
