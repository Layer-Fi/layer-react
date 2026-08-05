import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { PaymentMethod } from '@schemas/invoices/paymentMethod'
import { translationKey } from '@utils/shared/i18n/translationKey'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { ComboBoxField } from '@blocks/Form/ComboBoxField'

type PaymentMethodOption = {
  label: string
  value: PaymentMethod
}

const PAYMENT_METHOD_OPTIONS = [
  { value: PaymentMethod.Cash, ...translationKey('common:label.cash', 'Cash') },
  { value: PaymentMethod.Check, ...translationKey('common:label.check', 'Check') },
  { value: PaymentMethod.CreditCard, ...translationKey('common:label.credit_card', 'Credit Card') },
  { value: PaymentMethod.Ach, ...translationKey('common:label.ach', 'ACH') },
  { value: PaymentMethod.Other, ...translationKey('common:label.other', 'Other') },
]

type PaymentMethodComboBoxProps = {
  value: PaymentMethod | null
  onValueChange: (value: PaymentMethod | null) => void
  isReadOnly?: boolean
  className?: string
  inline?: boolean
}

export const PaymentMethodComboBox = ({ value, onValueChange, isReadOnly, className, inline }: PaymentMethodComboBoxProps) => {
  const { t } = useTranslation()
  const options = useMemo<PaymentMethodOption[]>(
    () => PAYMENT_METHOD_OPTIONS.map(opt => ({
      value: opt.value,
      label: t(opt.i18nKey, opt.defaultValue),
    })),
    [t],
  )

  const selectedOption = value ? (options.find(o => o.value === value) ?? null) : null
  const handleChange = (option: null | PaymentMethodOption) => {
    onValueChange(option?.value || null)
  }
  const onSelectedValueChange = useCallback(handleChange, [onValueChange])

  return (
    <ComboBoxField label={t('invoices:label.payment_method', 'Payment method')} className={className} inline={inline}>
      {controlProps => (
        <ComboBox
          {...controlProps}
          options={options}
          onSelectedValueChange={onSelectedValueChange}
          selectedValue={selectedOption}
          isSearchable={false}
          isReadOnly={isReadOnly}
        />
      )}
    </ComboBoxField>
  )
}
