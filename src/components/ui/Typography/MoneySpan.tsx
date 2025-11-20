import { type ComponentPropsWithoutRef, forwardRef } from 'react'
import classNames from 'classnames'

import { centsToDollars as formatMoney } from '@models/Money'
import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { Span, type TextStyleProps } from '@ui/Typography/Text'

import './moneySpan.scss'

const CLASS_NAME = 'Layer__MoneySpan'

type MoneySpanProps = {
  amount: number
  displayPlusSign?: boolean
} & TextStyleProps & Pick<ComponentPropsWithoutRef<'span'>, 'slot'>

const MoneySpan = forwardRef<HTMLSpanElement, MoneySpanProps>(
  ({ amount, displayPlusSign, className, ...restProps }, ref) => {
    const dataProperties = toDataProperties({
      'positive': amount >= 0,
      'negative': amount < 0,
      'display-plus-sign': displayPlusSign,
    })

    return (
      <Span {...restProps} {...dataProperties} className={classNames(CLASS_NAME, className)} ref={ref}>
        {formatMoney(Math.abs(amount))}
      </Span>
    )
  },
)
MoneySpan.displayName = 'MoneySpan'

export { MoneySpan }
