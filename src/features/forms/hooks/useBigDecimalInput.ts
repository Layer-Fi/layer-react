import { useCallback, useEffect, useMemo, useState } from 'react'
import { BigDecimal as BD, Option } from 'effect'

import {
  BIG_DECIMAL_ZERO,
  buildDecimalCharRegex,
  convertPercentToDecimal,
  formatBigDecimalToString,
} from '@utils/bigDecimalUtils'

const DECORATOR_CHARS_REGEX = /[,%$]/g

type UseBigDecimalInputOptions = {
  bdValue: BD.BigDecimal
  onValueChange: (bd: BD.BigDecimal) => void
  onBlur: () => void
  mode: 'percent' | 'currency' | 'decimal'
  maxValue: BD.BigDecimal
  maxDecimalPlaces: number
  minDecimalPlaces: number
  allowNegative: boolean
}

export function useBigDecimalInput({
  bdValue,
  onValueChange,
  onBlur,
  mode,
  maxValue,
  maxDecimalPlaces,
  minDecimalPlaces,
  allowNegative,
}: UseBigDecimalInputOptions) {
  const formattingProps = useMemo(() => ({
    minDecimalPlaces,
    maxDecimalPlaces,
    mode,
  }), [maxDecimalPlaces, minDecimalPlaces, mode])

  const [inputValue, setInputValue] = useState<string>(formatBigDecimalToString(bdValue, formattingProps))

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

    if (!BD.equals(clamped, bdValue)) {
      onValueChange(clamped)
    }
    onBlur()

    setInputValue(formatBigDecimalToString(clamped, formattingProps))
  }, [inputValue, mode, maxValue, maxDecimalPlaces, bdValue, onBlur, formattingProps, onValueChange])

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

  useEffect(() => {
    setInputValue(formatBigDecimalToString(bdValue, formattingProps))
  }, [bdValue, formattingProps])

  return {
    inputValue,
    onInputChange,
    onInputBlur,
    onBeforeInput,
    onPaste,
  }
}
