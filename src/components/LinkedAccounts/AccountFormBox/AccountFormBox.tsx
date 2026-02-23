import { useEffect, useMemo } from 'react'
import { endOfDay } from 'date-fns'

import { type LinkedAccount } from '@internal-types/linked_accounts'
import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import CheckCircle from '@icons/CheckCircle'
import InstitutionIcon from '@icons/InstitutionIcon'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { DatePicker } from '@components/DatePicker/DatePicker'
import { useDatePickerState } from '@components/DatePicker/useDatePickerState'
import { AmountInput } from '@components/Input/AmountInput'
import { InputGroup } from '@components/Input/InputGroup'
import { ErrorText } from '@components/Typography/ErrorText'
import { Text, TextSize } from '@components/Typography/Text'

import './accountFormBox.scss'

export type AccountFormBoxData = {
  account: LinkedAccount
  isConfirmed: boolean
  openingDate: Date
  openingBalance?: string
  saved?: boolean
  isDateInvalid?: boolean
}

type AccountFormProps = {
  account: LinkedAccount
  value: AccountFormBoxData
  isSaved?: boolean
  disableConfirmExclude?: boolean
  errors?: string[]
  onChange: (value: AccountFormBoxData) => void
}

const CLASS_NAME = 'Layer__caobfb'

export const AccountFormBox = ({
  account,
  value,
  isSaved = false,
  disableConfirmExclude = false,
  onChange,
  errors = [],
}: AccountFormProps) => {
  const dataProps = useMemo(() => (
    toDataProperties({
      saved: isSaved,
      confirmed: value.isConfirmed,
    })
  ), [isSaved, value.isConfirmed])

  const maxDate = useMemo(() => endOfDay(new Date()), [])
  const passedDate = useMemo(() => value.openingDate, [value.openingDate])

  const {
    localDate: date,
    onChange: onChangeDate,
    maxDateZdt,
    isInvalid: isDateInvalid,
    errorText: dateErrorText,
    onBlur: onBlurDate,
  } = useDatePickerState({
    date: passedDate,
    maxDate,
    setDate: date => onChange({ ...value, openingDate: date, isDateInvalid: false }),
  })

  // Update parent with isDateInvalid state whenever it changes
  useEffect(() => {
    if (value.isDateInvalid !== isDateInvalid) {
      onChange({ ...value, isDateInvalid })
    }
  }, [isDateInvalid, onChange, value])

  return (
    <div {...dataProps} className={CLASS_NAME}>
      <div className={`${CLASS_NAME}__icon-col`}>
        {account.institution?.logo != undefined
          ? (
            <img
              width={32}
              height={32}
              src={`data:image/png;base64,${account.institution.logo}`}
              alt={
                account.institution?.name
                  ? account.institution?.name
                  : account.external_account_name
              }
            />
          )
          : (
            <InstitutionIcon />
          )}
      </div>
      <div className={`${CLASS_NAME}__details-col`}>
        <div className={`${CLASS_NAME}__details-col__details`}>
          <div className={`${CLASS_NAME}__details-col__name`}>
            <Text
              className={`${CLASS_NAME}__details-col__name__institution-name`}
              size={TextSize.sm}
            >
              {account.institution?.name}
            </Text>
            <Text
              className={`${CLASS_NAME}__details-col__name__account-name`}
              size={TextSize.sm}
            >
              {account.external_account_name}
            </Text>
          </div>
          <Text size={TextSize.sm}>
            •••
            {account.mask}
          </Text>
        </div>
        <div className={`${CLASS_NAME}__details-col__inputs`}>
          <InputGroup label='Opening date'>
            <DatePicker
              label='Opening date'
              date={date}
              onChange={onChangeDate}
              onBlur={onBlurDate}
              maxDate={maxDateZdt}
              isDisabled={!disableConfirmExclude && !value.isConfirmed}
              isInvalid={isDateInvalid}
              errorText={dateErrorText}
            />
          </InputGroup>
          <InputGroup label='Opening balance'>
            <AmountInput
              name='openingBalance'
              defaultValue={value.openingBalance}
              onChange={newValue =>
                onChange({ ...value, openingBalance: newValue })}
              disabled={!disableConfirmExclude && !value.isConfirmed}
              isInvalid={errors.includes('MISSING_BALANCE')}
              errorMessage='Field is required'
            />
          </InputGroup>
        </div>
        {errors.includes('API_ERROR') && (
          <ErrorText>
            An error occurred while saving data.
            You will have an opportunity to try again later.
          </ErrorText>
        )}
      </div>
      {!disableConfirmExclude && (
        <div className={`${CLASS_NAME}__confirm-col`}>
          <Checkbox
            size='lg'
            isSelected={value.isConfirmed}
            onChange={v => onChange({ ...value, isConfirmed: v })}
            aria-label='Confirm Account Inclusion'
          />
        </div>
      )}
      <div className={`${CLASS_NAME}__success-banner`}>
        <CheckCircle size={36} />
      </div>
    </div>
  )
}
