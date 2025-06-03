import { type ReactNode } from 'react'
import classNames from 'classnames'
import CurrencyInput, { CurrencyInputProps } from 'react-currency-input-field'
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip'

export interface AmountInputProps extends Omit<CurrencyInputProps, 'onChange'> {
  onChange?: (value?: string) => void
  isInvalid?: boolean
  errorMessage?: string
  leftText?: string
  badge?: ReactNode
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
      onValueChange={onChange}
      className={baseClassName}
    />
  )

  return (
    <Tooltip disabled={!isInvalid || !errorMessage}>
      <TooltipTrigger className='Layer__input-tooltip'>
        {badge
          ? (
            <div className='Layer__input-with-badge'>
              {currencyInput}
              {badge}
            </div>
          )
          : currencyInput}
        {leftText && <span className='Layer__input-left-text'>{leftText}</span>}
      </TooltipTrigger>
      <TooltipContent className='Layer__tooltip'>{errorMessage}</TooltipContent>
    </Tooltip>
  )
}
