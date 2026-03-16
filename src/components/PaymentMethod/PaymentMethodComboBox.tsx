import { useCallback, useId, useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { translationKey } from '@utils/i18n/translationKey'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { HStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'
import { PaymentMethod } from '@components/PaymentMethod/schemas'

import './paymentMethodComboBox.scss'

type PaymentMethodOption = {
  label: string
  value: PaymentMethod
}

const PAYMENT_METHOD_OPTIONS = [
  { value: PaymentMethod.Cash, ...translationKey('common.cash', 'Cash') },
  { value: PaymentMethod.Check, ...translationKey('common.check', 'Check') },
  { value: PaymentMethod.CreditCard, ...translationKey('common.creditCard', 'Credit Card') },
  { value: PaymentMethod.Ach, ...translationKey('common.ach', 'ACH') },
  { value: PaymentMethod.Other, ...translationKey('common.other', 'Other') },
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
  const combinedClassName = classNames(
    'Layer__PaymentMethodComboBox',
    inline && 'Layer__PaymentMethodComboBox--inline',
    className,
  )

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

  const inputId = useId()

  return (
    <HStack className={combinedClassName}>
      <Label size='sm' htmlFor={inputId}>
        {t('invoices.paymentMethod', 'Payment method')}
      </Label>
      <ComboBox
        options={options}
        onSelectedValueChange={onSelectedValueChange}
        selectedValue={selectedOption}
        isSearchable={false}
        inputId={inputId}
        isReadOnly={isReadOnly}
      />
    </HStack>
  )
}
