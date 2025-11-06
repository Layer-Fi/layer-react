import { useCallback, useId } from 'react'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { ZonedDateTime } from '@internationalized/date'
import { differenceInDays, startOfDay } from 'date-fns'
import { HStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'

export enum InvoiceTermsValues {
  Net10 = 'Net10',
  Net15 = 'Net15',
  Net30 = 'Net30',
  Net60 = 'Net60',
  Net90 = 'Net90',
  Custom = 'Custom',
}

type InvoiceTermsOption = {
  label: string
  value: InvoiceTermsValues
}
const InvoiceTermsOptionConfig = {
  [InvoiceTermsValues.Net10]: { label: 'Net 10', value: InvoiceTermsValues.Net10 },
  [InvoiceTermsValues.Net15]: { label: 'Net 15', value: InvoiceTermsValues.Net15 },
  [InvoiceTermsValues.Net30]: { label: 'Net 30', value: InvoiceTermsValues.Net30 },
  [InvoiceTermsValues.Net60]: { label: 'Net 60', value: InvoiceTermsValues.Net60 },
  [InvoiceTermsValues.Net90]: { label: 'Net 90', value: InvoiceTermsValues.Net90 },
  [InvoiceTermsValues.Custom]: { label: 'Custom', value: InvoiceTermsValues.Custom },
}
const options = Object.values(InvoiceTermsOptionConfig)

export const getDurationInDaysFromTerms = (terms: InvoiceTermsValues) => {
  switch (terms) {
    case InvoiceTermsValues.Net10:
      return 10
    case InvoiceTermsValues.Net15:
      return 15
    case InvoiceTermsValues.Net30:
      return 30
    case InvoiceTermsValues.Net60:
      return 60
    case InvoiceTermsValues.Net90:
      return 90
    case InvoiceTermsValues.Custom:
    default:
      return undefined
  }
}

export const getInvoiceTermsFromDates = (sentAt: ZonedDateTime | null, dueAt: ZonedDateTime | null): InvoiceTermsValues => {
  if (!sentAt || !dueAt) return InvoiceTermsValues.Custom

  const days = differenceInDays(
    startOfDay(dueAt.toDate()),
    startOfDay(sentAt.toDate()),
  )

  switch (days) {
    case 10:
      return InvoiceTermsValues.Net10
    case 15:
      return InvoiceTermsValues.Net15
    case 30:
      return InvoiceTermsValues.Net30
    case 60:
      return InvoiceTermsValues.Net60
    case 90:
      return InvoiceTermsValues.Net90
    default:
      return InvoiceTermsValues.Custom
  }
}

type InvoiceTermsComboBoxProps = {
  value: InvoiceTermsValues
  onValueChange: (value: InvoiceTermsValues | null) => void
  isReadOnly?: boolean
}

export const InvoiceTermsComboBox = ({ value, onValueChange, isReadOnly }: InvoiceTermsComboBoxProps) => {
  const selectedOption = InvoiceTermsOptionConfig[value]
  const onSelectedValueChange = useCallback((option: InvoiceTermsOption | null) => {
    onValueChange(option?.value || null)
  }, [onValueChange])

  const inputId = useId()

  return (
    <HStack className='Layer__InvoiceForm__TermsComboBox Layer__InvoiceForm__Field__Terms'>
      <Label size='sm' htmlFor={inputId}>
        Terms
      </Label>
      <ComboBox
        options={options}
        onSelectedValueChange={onSelectedValueChange}
        selectedValue={selectedOption}
        isSearchable={false}
        isClearable={false}
        inputId={inputId}
        isReadOnly={isReadOnly}
      />
    </HStack>
  )
}
