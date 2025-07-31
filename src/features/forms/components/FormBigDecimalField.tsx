import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFieldContext } from '../hooks/useForm'
import { InputGroup } from '../../../components/ui/Input/InputGroup'
import { BigDecimal as BD, Option } from 'effect'
import { Input } from '../../../components/ui/Input/Input'
import { BIG_DECIMAL_ZERO, buildDecimalCharRegex, convertDecimalToPercent, convertPercentToDecimal, formatBigDecimalToString } from '../../../utils/bigDecimalUtils'
import { BaseFormTextField, type BaseFormTextFieldProps } from './BaseFormTextField'

type FormBigDecimalFieldProps = Omit<BaseFormTextFieldProps, 'inputMode'> & {
  maxValue?: number
  minDecimalPlaces?: number
  maxDecimalPlaces?: number
  allowNegative?: boolean
  mode?: 'percent' | 'currency' | 'decimal'
}

const DEFAULT_MAX_VALUE = 10_000_000
const DEFAULT_MIN_DECIMAL_PLACES = 0
const DEFAULT_MAX_DECIMAL_PLACES = 3
const DECORATOR_CHARS_REGEX = /[,%$]/g

export function FormBigDecimalField({
  mode = 'decimal',
  allowNegative = false,
  maxValue = mode === 'percent' ? 1 : DEFAULT_MAX_VALUE,
  minDecimalPlaces = mode === 'currency' ? 2 : DEFAULT_MIN_DECIMAL_PLACES,
  maxDecimalPlaces = mode === 'currency' ? 2 : DEFAULT_MAX_DECIMAL_PLACES,
  ...restProps
}: FormBigDecimalFieldProps) {
  const field = useFieldContext<BD.BigDecimal>()

  const { name, state, handleChange, handleBlur } = field
  const { value } = state

  const maxBigDecimalValue = BD.unsafeFromNumber(maxValue)
  const formattingProps = useMemo(() => ({
    minDecimalPlaces,
    maxDecimalPlaces,
    mode,
  }), [maxDecimalPlaces, minDecimalPlaces, mode])

  const [inputValue, setInputValue] = useState<string>(formatBigDecimalToString(value, formattingProps))

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const onInputBlur = useCallback(() => {
    const sanitizedInput = inputValue.replace(DECORATOR_CHARS_REGEX, '')
    const maybeDecimal = BD.fromString(sanitizedInput)

    const decimal = Option.match(maybeDecimal, {
      onNone: () => BIG_DECIMAL_ZERO,
      onSome: value => value,
    })

    const adjustedForPercent = mode === 'percent'
      ? convertPercentToDecimal(decimal)
      : decimal

    const normalized = BD.normalize(adjustedForPercent)
    const clamped = BD.min(normalized, maxBigDecimalValue)

    handleChange(clamped)
    handleBlur()

    const displayValue = mode === 'percent'
      ? convertDecimalToPercent(clamped)
      : clamped

    setInputValue(formatBigDecimalToString(displayValue, formattingProps))
  }, [inputValue, mode, maxBigDecimalValue, handleChange, handleBlur, formattingProps])

  // Don't allow the user to type anything other than numeric characters, commas, decimals, etc
  const allowedChars = useMemo(() =>
    buildDecimalCharRegex({ allowNegative, allowPercent: mode === 'percent', allowDollar: mode === 'currency' }),
  [allowNegative, mode])

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
    setInputValue(formatBigDecimalToString(value, formattingProps))
  }, [value, formattingProps])

  return (
    <BaseFormTextField {...restProps} inputMode='decimal'>
      <InputGroup>
        <Input
          inset
          id={name}
          name={name}
          value={inputValue}
          onChange={onInputChange}
          onBlur={onInputBlur}
          onBeforeInput={onBeforeInput}
          onPaste={onPaste}
        />
      </InputGroup>
    </BaseFormTextField>
  )
}
