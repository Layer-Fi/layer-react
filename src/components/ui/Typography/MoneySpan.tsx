import { type ComponentPropsWithoutRef, forwardRef } from 'react'
import classNames from 'classnames'

import { centsToDollars as formatMoney } from '@models/Money'
import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import type { TextStyleProps } from '@ui/Typography/Text'

import './moneySpan.scss'

const CLASS_NAME = 'Layer__MoneySpan Layer__Span'

type MoneyTextProps = {
  amount: number
  displayPlusSign?: boolean
} & TextStyleProps & Pick<ComponentPropsWithoutRef<'span'>, 'slot'>

const MoneySpan = forwardRef<HTMLSpanElement, MoneyTextProps>(
  ({
    amount,
    displayPlusSign,
    align,
    ellipsis,
    noWrap,
    pb,
    pbe,
    pbs,
    size,
    status,
    variant,
    weight,
    className,
    ...restProps
  }, ref) => {
    const dataProperties = toDataProperties({
      'positive': amount >= 0,
      'negative': amount < 0,
      'display-plus-sign': displayPlusSign,
      align,
      ellipsis,
      'no-wrap': noWrap,
      pb,
      pbe,
      pbs,
      size,
      status,
      variant,
      weight,
    })

    return (
      <span {...restProps} {...dataProperties} className={classNames(CLASS_NAME, className)} ref={ref}>
        {formatMoney(Math.abs(amount))}
      </span>
    )
  },
)
MoneySpan.displayName = 'MoneySpan'

export { MoneySpan }
