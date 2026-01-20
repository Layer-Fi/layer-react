import { VStack } from '@ui/Stack/Stack'
import { InputGroup } from '@components/Input/InputGroup'
import { Input } from '@components/Input/Input'
import { PhoneInput } from '@components/Input/PhoneInput'
import { USStateSelect } from '@components/Input/USStateSelect'
import { DatePicker } from '@components/DatePicker/DatePicker'
import { useDatePickerState } from '@components/DatePicker/useDatePickerState'
import { USState } from '@internal-types/location'
import { useMemo } from 'react'
import { endOfToday } from 'date-fns'
import { convertDateToZonedDateTime } from '@utils/time/timeUtils'
import { Heading } from '@components/ui/Typography/Heading'

export interface TaxEstimateGeneralInformationProps {
  address1: string
  address2: string
  city: string
  state: USState | null
  zip: string
  phonePersonal: string
  dateOfBirth: Date | null
  ssn: string
  onAddress1Change: (value: string) => void
  onAddress2Change: (value: string) => void
  onCityChange: (value: string) => void
  onStateChange: (state: USState) => void
  onZipChange: (value: string) => void
  onPhonePersonalChange: (value?: string) => void
  onDateOfBirthChange: (date: Date) => void
  onSsnChange: (value: string) => void
}

export const TaxEstimateGeneralInformation = ({
  address1,
  address2,
  city,
  state,
  zip,
  phonePersonal,
  dateOfBirth,
  ssn,
  onAddress1Change,
  onAddress2Change,
  onCityChange,
  onStateChange,
  onZipChange,
  onPhonePersonalChange,
  onDateOfBirthChange,
  onSsnChange,
}: TaxEstimateGeneralInformationProps) => {
  const maxDate = useMemo(() => endOfToday(), [])
  const maxDateZdt = useMemo(() => convertDateToZonedDateTime(maxDate), [maxDate])

  const { onChange, errorText, isInvalid, onBlur } = useDatePickerState({
    date: dateOfBirth || new Date(),
    setDate: onDateOfBirthChange,
    maxDate,
  })

  const dateZdt = useMemo(() => dateOfBirth ? convertDateToZonedDateTime(dateOfBirth) : null, [dateOfBirth])

  return (
    <VStack gap='md'>
      <Heading size='lg'>General Information</Heading>
      <InputGroup name='address1' label='Address Line 1'>
        <Input
          className='Layer__input--address'
          name='address1'
          value={address1}
          onChange={e => onAddress1Change((e.target as HTMLInputElement).value)}
          placeholder='Enter address line 1'
        />
      </InputGroup>

      <InputGroup name='address2' label='Address Line 2'>
        <Input
          className='Layer__input--address'
          name='address2'
          value={address2}
          onChange={e => onAddress2Change((e.target as HTMLInputElement).value)}
          placeholder='Enter address line 2 (optional)'
        />
      </InputGroup>

      <InputGroup name='city' label='City'>
        <Input
          name='city'
          value={city}
          onChange={e => onCityChange((e.target as HTMLInputElement).value)}
          placeholder='Enter city'
        />
      </InputGroup>

      <InputGroup name='state' label='State'>
        <USStateSelect
          value={state?.value}
          onChange={onStateChange}
        />
      </InputGroup>

      <InputGroup name='zip' label='Zip Code'>
        <Input
          name='zip'
          value={zip}
          onChange={e => onZipChange((e.target as HTMLInputElement).value)}
          placeholder='Enter zip code'
        />
      </InputGroup>

      <InputGroup name='phonePersonal' label='Personal Phone Number'>
        <PhoneInput
          value={phonePersonal}
          onChange={onPhonePersonalChange}
          placeholder='Enter phone number'
        />
      </InputGroup>

      <DatePicker
        label='Date of Birth'
        date={dateZdt}
        onChange={onChange}
        maxDate={maxDateZdt}
        isInvalid={isInvalid && dateOfBirth !== null}
        errorText={errorText}
        onBlur={onBlur}
      />

      <InputGroup name='ssn' label='Social Security Number'>
        <Input
          name='ssn'
          type='text'
          value={ssn}
          onChange={e => onSsnChange((e.target as HTMLInputElement).value.replace(/\D/g, ''))}
          placeholder='Enter SSN'
          maxLength={9}
        />
      </InputGroup>
    </VStack>
  )
}
