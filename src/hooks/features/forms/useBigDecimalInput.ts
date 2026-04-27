import { useCallback, useEffect, useMemo, useState } from 'react'
import { BigDecimal as BD, Option } from 'effect'
import { useIntl } from 'react-intl'

import {
  BIG_DECIMAL_ZERO,
  buildDecimalCharRegex,
  convertPercentToDecimal,
  formatBigDecimalToString,
} from '@utils/bigDecimalUtils'
import { transformCurrencyValue } from '@utils/i18n/number/currency'
import { getLocaleNumberSeparators } from '@utils/i18n/number/input'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'

type UseBigDecimalInputOptions = {
  value: BD.BigDecimal | null
  onChange: (bd: BD.BigDecimal | null) => void
  onBlur: () => void
  mode: 'percent' | 'currency' | 'decimal'
  maxValue: BD.BigDecimal
  maxDecimalPlaces: number
  minDecimalPlaces: number
  allowNegative: boolean
  allowEmpty?: boolean
}

export function useBigDecimalInput({
  value,
  onChange,
  onBlur,
  mode,
  maxValue,
  maxDecimalPlaces,
  minDecimalPlaces,
  allowNegative,
  allowEmpty,
}: UseBigDecimalInputOptions) {
  const intl = useIntl()
  const formatter = useIntlFormatter()
  const { decimalSeparator: sourceDecimalSeparator } = getLocaleNumberSeparators(intl.locale)

  const formattingProps = useMemo(() => ({
    minDecimalPlaces,
    maxDecimalPlaces,
    mode,
  }), [maxDecimalPlaces, minDecimalPlaces, mode])

  const [inputValue, setInputValue] = useState<string>(
    value === null ? '' : formatBigDecimalToString(formatter, value, formattingProps),
  )

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const sanitizeInput = useCallback((rawValue: string) =>
    transformCurrencyValue(rawValue, {
      sourceDecimalSeparator,
      targetDecimalSeparator: '.',
      allowNegative,
    }),
  [allowNegative, sourceDecimalSeparator])

  const onInputBlur = useCallback(() => {
    const sanitizedInput = sanitizeInput(inputValue)

    if (allowEmpty && sanitizedInput === '') {
      if (value !== null) onChange(null)
      onBlur()
      setInputValue('')
      return
    }

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

    if (value === null || !BD.equals(clamped, value)) {
      onChange(clamped)
    }
    onBlur()

    setInputValue(formatBigDecimalToString(formatter, clamped, formattingProps))
  }, [
    inputValue,
    sanitizeInput,
    allowEmpty,
    maxDecimalPlaces,
    mode,
    maxValue,
    value,
    onBlur,
    formattingProps,
    onChange,
    formatter,
  ])

  const allowedChars = useMemo(() =>
    buildDecimalCharRegex({
      allowNegative,
      allowPercent: mode === 'percent',
      allowCurrencySymbol: mode === 'currency',
      locale: intl.locale,
    }),
  [allowNegative, intl.locale, mode])

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
    setInputValue(value === null ? '' : formatBigDecimalToString(formatter, value, formattingProps))
  }, [value, formattingProps, formatter])

  return {
    inputValue,
    onInputChange,
    onInputBlur,
    onBeforeInput,
    onPaste,
  }
}
