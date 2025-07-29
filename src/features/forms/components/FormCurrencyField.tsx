import { useCallback, useEffect, useState } from 'react'
import { useFieldContext } from '../hooks/useForm'
import CurrencyInput from 'react-currency-input-field'
import { InputGroup } from '../../../components/ui/Input/InputGroup'
import { BigDecimal as BD, Option } from 'effect'
import { convertBigDecimalToCents } from '../../../utils/bigDecimalUtils'
import { centsToDollarsWithoutCommas } from '../../../models/Money'
import { BaseFormTextField, type BaseFormTextFieldProps } from './BaseFormTextField'

type FormCurrencyFieldProps = Omit<BaseFormTextFieldProps, 'inputMode'>

const ZERO_CENTS_INPUT_VALUE = '0.00'
const getCurrencyInputValueFromCents = (cents: number) => !Number.isNaN(cents) ? centsToDollarsWithoutCommas(cents) : ZERO_CENTS_INPUT_VALUE

export function FormCurrencyField(props: FormCurrencyFieldProps) {
  const field = useFieldContext<number>()
  const { label } = props

  const { name, state, handleChange, handleBlur } = field
  const { value } = state

  const [inputValue, setInputValue] = useState<string>(getCurrencyInputValueFromCents(value))

  const onInputChange = useCallback((newValue: string | undefined) => {
    setInputValue(newValue ?? ZERO_CENTS_INPUT_VALUE)
  }, [])

  const onInputBlur = useCallback(() => {
    const maybeAmount = BD.fromString(inputValue)

    const cents = Option.match(maybeAmount, {
      onNone: () => 0,
      onSome: amount => convertBigDecimalToCents(amount),
    })

    handleChange(cents)
    handleBlur()

    setInputValue(getCurrencyInputValueFromCents(cents))
  }, [inputValue, handleChange, handleBlur])

  // Keep the input value in sync with the form value if it ever changes first
  useEffect(() => {
    setInputValue(getCurrencyInputValueFromCents(value))
  }, [value])

  return (
    <BaseFormTextField {...props}>
      <InputGroup>
        <CurrencyInput
          name={name}
          intlConfig={{
            locale: 'en-US',
            currency: 'USD',
          }}
          prefix='$'
          decimalScale={2}
          decimalsLimit={2}
          disableAbbreviations
          value={inputValue}
          onValueChange={onInputChange}
          onBlur={onInputBlur}
          className='Layer__UI__Input'
          data-inset='true'
          aria-label={label}
        />
      </InputGroup>
    </BaseFormTextField>
  )
}
