import { useCallback, useMemo } from 'react'
import classNames from 'classnames'
import CurrencyInput, { type CurrencyInputProps } from 'react-currency-input-field'
import { type IntlShape, useIntl } from 'react-intl'

import { transformCurrencyValue } from '@utils/i18n/number/currency'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip/Tooltip'
import { getCurrencyFormatConfig } from '@components/Input/amountInputUtils'

import './amountInput.scss'

export interface AmountInputProps extends Omit<CurrencyInputProps, 'onChange' | 'placeholder'> {
  onChange?: (value?: string) => void
  isInvalid?: boolean
  errorMessage?: string
}

export const AmountInput = ({
  onChange,
  className,
  errorMessage,
  isInvalid,
  ...props
}: AmountInputProps) => {
  const intl: IntlShape = useIntl()
  const formatter = useIntlFormatter()

  const currencyFormatConfig = useMemo(() => getCurrencyFormatConfig(intl), [intl])
  const sourceDecimalSeparator = currencyFormatConfig.decimalSeparator

  const transformRawValue = useCallback(
    (rawValue: string) => transformCurrencyValue(rawValue, {
      sourceDecimalSeparator,
      maxFractionDigits: 2,
    }),
    [sourceDecimalSeparator],
  )

  const currencyInputClassName = classNames(
    'Layer__AmountInput',
    isInvalid ? 'Layer__AmountInput--Error' : '',
    className,
  )

  return (
    <Tooltip isDisabled={!isInvalid || !errorMessage}>
      <TooltipTrigger className='Layer__AmountInput__Tooltip'>
        <CurrencyInput
          {...props}
          {...currencyFormatConfig}
          placeholder={formatter.formatCurrencyFromCents(0)}
          decimalScale={2}
          decimalsLimit={2}
          disableAbbreviations
          allowDecimals
          transformRawValue={transformRawValue}
          onValueChange={onChange}
          className={currencyInputClassName}
        />
      </TooltipTrigger>
      <TooltipContent>{errorMessage}</TooltipContent>
    </Tooltip>
  )
}
