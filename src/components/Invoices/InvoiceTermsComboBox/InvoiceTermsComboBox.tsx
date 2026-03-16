import { useCallback, useId, useMemo } from 'react'
import { type ZonedDateTime } from '@internationalized/date'
import { differenceInDays, startOfDay } from 'date-fns'
import { useTranslation } from 'react-i18next'

import { translationKey } from '@utils/i18n/translationKey'
import { ComboBox } from '@ui/ComboBox/ComboBox'
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

const INVOICE_TERMS_CONFIG = [
  { value: InvoiceTermsValues.Net10, ...translationKey('invoices.net10', 'Net 10') },
  { value: InvoiceTermsValues.Net15, ...translationKey('invoices.net15', 'Net 15') },
  { value: InvoiceTermsValues.Net30, ...translationKey('invoices.net30', 'Net 30') },
  { value: InvoiceTermsValues.Net60, ...translationKey('invoices.net60', 'Net 60') },
  { value: InvoiceTermsValues.Net90, ...translationKey('invoices.net90', 'Net 90') },
  { value: InvoiceTermsValues.Custom, ...translationKey('invoices.custom', 'Custom') },
]

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
  const { t } = useTranslation()

  const options = useMemo<InvoiceTermsOption[]>(
    () => INVOICE_TERMS_CONFIG.map(opt => ({
      value: opt.value,
      label: t(opt.i18nKey, opt.defaultValue),
    })),
    [t],
  )

  const selectedOption = value ? (options.find(o => o.value === value) ?? null) : null
  const handleChange = (option: null | InvoiceTermsOption) => {
    onValueChange(option?.value || null)
  }
  const onSelectedValueChange = useCallback(handleChange, [onValueChange])

  const inputId = useId()

  return (
    <HStack className='Layer__InvoiceForm__TermsComboBox Layer__InvoiceForm__Field__Terms'>
      <Label size='sm' htmlFor={inputId}>
        {t('invoices.terms', 'Terms')}
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
