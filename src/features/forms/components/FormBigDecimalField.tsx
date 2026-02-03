import { type ReactNode } from 'react'
import { BigDecimal as BD } from 'effect'

import { BIG_DECIMAL_ONE } from '@utils/bigDecimalUtils'
import { Input } from '@ui/Input/Input'
import { InputGroup } from '@ui/Input/InputGroup'
import { HStack } from '@ui/Stack/Stack'
import { BaseFormTextField, type BaseFormTextFieldProps } from '@features/forms/components/BaseFormTextField'
import { useBigDecimalInput } from '@features/forms/hooks/useBigDecimalInput'
import { useFieldContext } from '@features/forms/hooks/useForm'

type FormBigDecimalFieldProps = Omit<BaseFormTextFieldProps, 'inputMode' | 'isTextArea'> & {
  maxValue?: BD.BigDecimal
  minDecimalPlaces?: number
  maxDecimalPlaces?: number
  allowNegative?: boolean
  mode?: 'percent' | 'currency' | 'decimal'
  slots?: { badge?: ReactNode }
  placeholder?: string
}

const DEFAULT_MAX_VALUE = BD.fromBigInt(BigInt(10_000_000))
const DEFAULT_MIN_DECIMAL_PLACES = 0
const DEFAULT_MAX_DECIMAL_PLACES = 3

export function FormBigDecimalField({
  mode = 'decimal',
  allowNegative = false,
  maxValue = mode === 'percent' ? BIG_DECIMAL_ONE : DEFAULT_MAX_VALUE,
  minDecimalPlaces = mode === 'currency' ? 2 : DEFAULT_MIN_DECIMAL_PLACES,
  maxDecimalPlaces = mode === 'currency' ? 2 : DEFAULT_MAX_DECIMAL_PLACES,
  slots,
  placeholder,
  ...restProps
}: FormBigDecimalFieldProps) {
  const field = useFieldContext<BD.BigDecimal>()
  const { name, state, handleChange, handleBlur } = field
  const { value } = state

  const { inputValue, onInputChange, onInputBlur, onBeforeInput, onPaste } = useBigDecimalInput({
    value,
    onChange: handleChange,
    onBlur: handleBlur,
    mode,
    maxValue,
    maxDecimalPlaces,
    minDecimalPlaces,
    allowNegative,
  })

  return (
    <BaseFormTextField {...restProps} inputMode='decimal'>
      <InputGroup slot='input' actionCount={slots ? 2 : undefined}>
        <Input
          inset
          id={name}
          name={name}
          value={inputValue}
          onChange={onInputChange}
          onBlur={onInputBlur}
          onBeforeInput={onBeforeInput}
          onPaste={onPaste}
          placeholder={placeholder}
        />
        {slots?.badge && <HStack>{slots.badge}</HStack>}
      </InputGroup>
    </BaseFormTextField>
  )
}
