import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFieldContext } from '../hooks/useForm'
import { InputGroup } from '../../../components/ui/Input/InputGroup'
import { BigDecimal as BD, Option } from 'effect'
import type { BigDecimal as BigDecimalType } from 'effect/BigDecimal'
import { Input } from '../../../components/ui/Input/Input'
import { BIG_DECIMAL_ZERO, DECIMAL_CHARS_REGEX, NON_NEGATIVE_DECIMAL_CHARS_REGEX, formatBigDecimalToString } from '../../../utils/bigDecimalUtils'
import { BaseFormTextField, type BaseFormTextFieldProps } from './BaseFormTextField'

type FormBigDecimalFieldProps = {
  slotProps: {
    BaseFormTextField: Omit<BaseFormTextFieldProps, 'inputMode'>
  }
  maxInputLength?: number
  allowNegative?: boolean
}

const DEFAULT_MAX_INPUT_LENGTH = 10
export function FormBigDecimalField({
  slotProps,
  maxInputLength = DEFAULT_MAX_INPUT_LENGTH,
  allowNegative = false,
}: FormBigDecimalFieldProps) {
  const field = useFieldContext<BigDecimalType>()

  const { name, state, handleChange, handleBlur } = field
  const { value } = state

  const [inputValue, setInputValue] = useState<string>(formatBigDecimalToString(value, maxInputLength))

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const onInputBlur = useCallback(() => {
    const cleaned = inputValue.replace(/,/g, '')
    const maybeDecimal = BD.fromString(cleaned)

    const decimal = Option.match(maybeDecimal, {
      onNone: () => BIG_DECIMAL_ZERO,
      onSome: amount => amount,
    })
    const normalizedDecimal = BD.normalize(decimal)

    handleChange(normalizedDecimal)
    handleBlur()

    setInputValue(formatBigDecimalToString(normalizedDecimal, maxInputLength))
  }, [inputValue, handleBlur, handleChange, maxInputLength])

  // Don't allow the user to type anything other than numeric characters, commas, decimals, etc
  const allowedChars = useMemo(() =>
    allowNegative ? DECIMAL_CHARS_REGEX : NON_NEGATIVE_DECIMAL_CHARS_REGEX,
  [allowNegative])

  const onBeforeInput = useCallback((e: React.FormEvent<HTMLInputElement> & { data: string | null }) => {
    if (e.data && !allowedChars.test(e.data)) {
      e.preventDefault()
    }
  }, [allowedChars])

  const onPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text')

    if (!allowedChars.test(pastedText)) {
      e.preventDefault()
    }
  }, [allowedChars])

  // Keep the input value in sync with the form value if it ever changes first
  useEffect(() => {
    setInputValue(formatBigDecimalToString(value, maxInputLength))
  }, [value, maxInputLength])

  return (
    <BaseFormTextField {...slotProps.BaseFormTextField} inputMode='decimal'>
      <InputGroup>
        <Input
          inset
          id={name}
          name={name}
          value={inputValue}
          onChange={onInputChange}
          onBlur={onInputBlur}
          maxLength={maxInputLength}
          onBeforeInput={onBeforeInput}
          onPaste={onPaste}
        />
      </InputGroup>
    </BaseFormTextField>
  )
}
