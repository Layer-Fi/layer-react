import { type ReactNode } from 'react'
import classNames from 'classnames'
import CurrencyInput, { type CurrencyInputProps } from 'react-currency-input-field'

import { DeprecatedTooltip, DeprecatedTooltipContent, DeprecatedTooltipTrigger } from '@components/Tooltip/Tooltip'

export interface AmountInputProps extends Omit<CurrencyInputProps, 'onChange'> {
  onChange?: (value?: string) => void
  isInvalid?: boolean
  errorMessage?: string
  leftText?: string
  badge?: ReactNode
}

const transformCurrencyValue = (rawValue: string): string => {
  // Remove non-digit characters except decimal point
  const cleaned = rawValue.replace(/[^\d.]/g, '')

  // If there are more than 2 digits after decimal, shift them left
  const parts = cleaned.split('.')
  const integerPartRaw = parts[0]
  const decimalPartRaw = parts[1]
  if (parts.length === 2 && integerPartRaw !== undefined && decimalPartRaw !== undefined && decimalPartRaw.length > 2) {
    const integerPart = integerPartRaw + decimalPartRaw.slice(0, -2)
    const decimalPart = decimalPartRaw.slice(-2)
    return `${integerPart}.${decimalPart}`
  }

  return cleaned
}

export const AmountInput = ({
  onChange,
  className,
  leftText,
  errorMessage,
  isInvalid,
  badge,
  placeholder = '$0.00',
  ...props
}: AmountInputProps) => {
  const baseClassName = classNames(
    'Layer__input Layer__amount-input',
    badge ? 'Layer__amount-input--align-left' : 'Layer__amount-input--align-right',
    isInvalid ? 'Layer__input--error' : '',
    leftText ? 'Layer__input--with-left-text' : '',
    className,
  )

  const currencyInput = (
    <CurrencyInput
      {...props}
      intlConfig={{
        locale: 'en-US',
        currency: 'USD',
      }}
      prefix='$'
      placeholder={placeholder}
      decimalScale={2}
      decimalsLimit={2}
      disableAbbreviations
      allowDecimals
      transformRawValue={transformCurrencyValue}
      onValueChange={onChange}
      className={baseClassName}
    />
  )

  return (
    <DeprecatedTooltip disabled={!isInvalid || !errorMessage}>
      <DeprecatedTooltipTrigger className='Layer__input-tooltip'>
        {badge
          ? (
            <div className='Layer__input-with-badge'>
              {currencyInput}
              {badge}
            </div>
          )
          : currencyInput}
        {leftText && <span className='Layer__input-left-text'>{leftText}</span>}
      </DeprecatedTooltipTrigger>
      <DeprecatedTooltipContent className='Layer__tooltip'>{errorMessage}</DeprecatedTooltipContent>
    </DeprecatedTooltip>
  )
}
