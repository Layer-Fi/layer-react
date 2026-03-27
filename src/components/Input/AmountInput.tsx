import { useCallback, useMemo } from 'react'
import classNames from 'classnames'
import CurrencyInput, { type CurrencyInputProps } from 'react-currency-input-field'
import { type IntlShape, useIntl } from 'react-intl'

import { transformCurrencyValue } from '@utils/i18n/number/currency'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { getCurrencyFormatConfig } from '@components/Input/amountInputUtils'
import { DeprecatedTooltip, DeprecatedTooltipContent, DeprecatedTooltipTrigger } from '@components/Tooltip/Tooltip'

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
    'Layer__input',
    isInvalid ? 'Layer__input--error' : '',
    className,
  )

  return (
    <DeprecatedTooltip disabled={!isInvalid || !errorMessage}>
      <DeprecatedTooltipTrigger className='Layer__input-tooltip'>
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
      </DeprecatedTooltipTrigger>
      <DeprecatedTooltipContent className='Layer__tooltip'>{errorMessage}</DeprecatedTooltipContent>
    </DeprecatedTooltip>
  )
}
