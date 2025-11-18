import { useCallback, useId } from 'react'
import classNames from 'classnames'

import { ComboBox } from '@ui/ComboBox/ComboBox'
import { HStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'
import { PaymentMethod } from '@components/PaymentMethod/schemas'

import './paymentMethodComboBox.scss'

type PaymentMethodOption = {
  label: string
  value: PaymentMethod
}
const PaymentMethodOptionConfig = {
  [PaymentMethod.Cash]: { label: 'Cash', value: PaymentMethod.Cash },
  [PaymentMethod.Check]: { label: 'Check', value: PaymentMethod.Check },
  [PaymentMethod.CreditCard]: { label: 'Credit Card', value: PaymentMethod.CreditCard },
  [PaymentMethod.Ach]: { label: 'ACH', value: PaymentMethod.Ach },
  [PaymentMethod.Other]: { label: 'Other', value: PaymentMethod.Other },
}
const options = Object.values(PaymentMethodOptionConfig)

type PaymentMethodComboBoxProps = {
  value: PaymentMethod | null
  onValueChange: (value: PaymentMethod | null) => void
  isReadOnly?: boolean
  className?: string
  inline?: boolean
}

export const PaymentMethodComboBox = ({ value, onValueChange, isReadOnly, className, inline }: PaymentMethodComboBoxProps) => {
  const combinedClassName = classNames(
    'Layer__PaymentMethodComboBox',
    inline && 'Layer__PaymentMethodComboBox--inline',
    className,
  )

  const selectedOption = value ? PaymentMethodOptionConfig[value] : null
  const onSelectedValueChange = useCallback((option: PaymentMethodOption | null) => {
    onValueChange(option?.value || null)
  }, [onValueChange])

  const inputId = useId()

  return (
    <HStack className={combinedClassName}>
      <Label size='sm' htmlFor={inputId}>
        Payment method
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
