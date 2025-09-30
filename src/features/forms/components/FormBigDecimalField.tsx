import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useFieldContext } from '../hooks/useForm'
import { InputGroup } from '../../../components/ui/Input/InputGroup'
import { BigDecimal as BD, Option } from 'effect'
import { Input } from '../../../components/ui/Input/Input'
import { BIG_DECIMAL_ONE, BIG_DECIMAL_ZERO, buildDecimalCharRegex, convertPercentToDecimal, formatBigDecimalToString } from '../../../utils/bigDecimalUtils'
import { BaseFormTextField, type BaseFormTextFieldProps } from './BaseFormTextField'
import { HStack } from '../../../components/ui/Stack/Stack'

type FormBigDecimalFieldProps = Omit<BaseFormTextFieldProps, 'inputMode' | 'isTextArea'> & {
  maxValue?: BD.BigDecimal
  minDecimalPlaces?: number
  maxDecimalPlaces?: number
  allowNegative?: boolean
  mode?: 'percent' | 'currency' | 'decimal'
  slots?: { badge?: ReactNode }
}

const DEFAULT_MAX_VALUE = BD.fromBigInt(BigInt(10_000_000))
const DEFAULT_MIN_DECIMAL_PLACES = 0
const DEFAULT_MAX_DECIMAL_PLACES = 3
const DECORATOR_CHARS_REGEX = /[,%$]/g

/**
 * This is some crazy nonsense to make BigDecimal play nicely with TanStack form. TanStack form checks deep equality for
 * object form fields all the way down to determine if they've changed. BigDecimal has a `normalized` param, which is a
 * BigDecimal that is the "normalized" form of itself (i.e., lowest absolute scale). Therefore, when determining if two
 * BigDecimals values are equal, we do an infinite recursion comparing their normalized forms.
 *
 * To remediate this, before updating a BigDecimal field, we check the new value is equal (per BigDecimal.equal) outside,
 * and if not, only then call the onChange handler with the value wrapped with withForceUpdate, which adds a unique symbol
 * to the BigDecimal and short-circuits any potential infinite recursion on comparing normalized values all the way down.
 *
 * Doing either the equality check or forced update to cause inequality is sufficient, but we do both to cover our bases.
 */
export const withForceUpdate = (value: BD.BigDecimal): BD.BigDecimal => {
  // Define a new __forceUpdate property to ensure we still have access to the BigDecimal prototype.
  return Object.defineProperty(value, '__forceUpdate', {
    value: Symbol(),
    enumerable: true,
    configurable: true,
    writable: false,
  })
}

export function FormBigDecimalField({
  mode = 'decimal',
  allowNegative = false,
  maxValue = mode === 'percent' ? BIG_DECIMAL_ONE : DEFAULT_MAX_VALUE,
  minDecimalPlaces = mode === 'currency' ? 2 : DEFAULT_MIN_DECIMAL_PLACES,
  maxDecimalPlaces = mode === 'currency' ? 2 : DEFAULT_MAX_DECIMAL_PLACES,
  slots,
  ...restProps
}: FormBigDecimalFieldProps) {
  const field = useFieldContext<BD.BigDecimal>()

  const { name, state, handleChange, handleBlur } = field
  const { value } = state

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

    const rounded = BD.round(decimal, { scale: maxDecimalPlaces })

    const adjustedForPercent = mode === 'percent'
      ? convertPercentToDecimal(rounded)
      : rounded

    const normalized = BD.normalize(adjustedForPercent)
    const clamped = BD.min(normalized, maxValue)

    if (!BD.equals(clamped, value)) {
      handleChange(withForceUpdate(clamped))
    }
    handleBlur()

    setInputValue(formatBigDecimalToString(clamped, formattingProps))
  }, [inputValue, mode, maxValue, maxDecimalPlaces, value, handleBlur, formattingProps, handleChange])

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
        />
        {slots?.badge && <HStack>{slots.badge}</HStack>}
      </InputGroup>
    </BaseFormTextField>
  )
}
