import classNames from 'classnames'
import CurrencyInput, { CurrencyInputProps } from 'react-currency-input-field'
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip'

export interface AmountInputProps extends Omit<CurrencyInputProps, 'onChange' | 'value' | 'defaultValue'> {
  onChange?: (value?: string) => void
  isInvalid?: boolean
  errorMessage?: string
  leftText?: string
  value?: string | number
  defaultValue?: string | number
}

export const AmountInput = ({
  onChange,
  className,
  leftText,
  errorMessage,
  isInvalid,
  placeholder = '$0.00',
  ...props
}: AmountInputProps) => {
  const baseClassName = classNames(
    'Layer__input Layer__amount-input',
    isInvalid ? 'Layer__input--error' : '',
    leftText ? 'Layer__input--with-left-text' : '',
    className,
  )

  return (
    <Tooltip disabled={!isInvalid || !errorMessage}>
      <TooltipTrigger className='Layer__input-tooltip'>
        <CurrencyInput
          {...props}
          intlConfig={{
            locale: 'en-US',
            currency: 'USD',
          }}
          prefix='$'
          placeholder={placeholder}
          decimalsLimit={2}
          onValueChange={e => onChange?.(e)}
          className={baseClassName}
        />
        {leftText && <span className='Layer__input-left-text'>{leftText}</span>}
      </TooltipTrigger>
      <TooltipContent className='Layer__tooltip'>{errorMessage}</TooltipContent>
    </Tooltip>
  )
}
