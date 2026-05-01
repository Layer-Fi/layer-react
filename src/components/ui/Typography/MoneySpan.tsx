import { type ComponentPropsWithoutRef, forwardRef } from 'react'

import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Span, type TextStyleProps } from '@ui/Typography/Text'

export type MoneySpanProps = {
  amount: number
  displayPlusSign?: boolean
} & TextStyleProps & Pick<ComponentPropsWithoutRef<'span'>, 'slot'>

const MoneySpan = forwardRef<HTMLSpanElement, MoneySpanProps>(
  ({ amount, displayPlusSign, className, ...restProps }, ref) => {
    const { formatCurrencyFromCents } = useIntlFormatter()
    const formattedAmount = formatCurrencyFromCents(
      amount,
      { signDisplay: displayPlusSign ? 'always' : 'auto' },
    )

    return (
      <Span {...restProps} className={className} ref={ref}>
        {formattedAmount}
      </Span>
    )
  },
)
MoneySpan.displayName = 'MoneySpan'

export { MoneySpan }
