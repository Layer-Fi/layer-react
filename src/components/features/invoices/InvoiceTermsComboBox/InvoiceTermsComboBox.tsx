import { useCallback, useMemo } from 'react'
import { type ZonedDateTime } from '@internationalized/date'
import { differenceInDays, startOfDay } from 'date-fns'
import { useTranslation } from 'react-i18next'

import { InvoiceTermsValues } from '@schemas/features/invoices/invoiceTerms'
import { translationKey } from '@utils/shared/i18n/translationKey'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { ComboBoxField } from '@blocks/Form/ComboBoxField'

type InvoiceTermsOption = {
  label: string
  value: InvoiceTermsValues
}

const INVOICE_TERMS_CONFIG = [
  { value: InvoiceTermsValues.Net10, ...translationKey('invoices:InvoiceTermsComboBox.label.net_10', 'Net 10') },
  { value: InvoiceTermsValues.Net15, ...translationKey('invoices:InvoiceTermsComboBox.label.net_15', 'Net 15') },
  { value: InvoiceTermsValues.Net30, ...translationKey('invoices:InvoiceTermsComboBox.label.net_30', 'Net 30') },
  { value: InvoiceTermsValues.Net60, ...translationKey('invoices:InvoiceTermsComboBox.label.net_60', 'Net 60') },
  { value: InvoiceTermsValues.Net90, ...translationKey('invoices:InvoiceTermsComboBox.label.net_90', 'Net 90') },
  { value: InvoiceTermsValues.Custom, ...translationKey('invoices:InvoiceTermsComboBox.label.custom', 'Custom') },
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

  return (
    <ComboBoxField label={t('invoices:InvoiceTermsComboBox.label.terms', 'Terms')} className='Layer__InvoiceForm__Field__Terms' inline>
      {controlProps => (
        <ComboBox
          {...controlProps}
          options={options}
          onSelectedValueChange={onSelectedValueChange}
          selectedValue={selectedOption}
          isSearchable={false}
          isClearable={false}
          isReadOnly={isReadOnly}
        />
      )}
    </ComboBoxField>
  )
}
