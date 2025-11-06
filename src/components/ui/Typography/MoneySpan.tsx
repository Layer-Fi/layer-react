import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { centsToDollars as formatMoney } from '../../../models/Money'
import './moneySpan.scss'
import classNames from 'classnames'

const CLASS_NAME = 'Layer__MoneyText'

type MoneyTextProps = {
  amount: number
  bold?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  displayPlusSign?: boolean
} & Pick<ComponentPropsWithoutRef<'span'>, 'slot' | 'className'>

const MoneySpan = forwardRef<HTMLSpanElement, MoneyTextProps>(
  ({ amount, bold, size, displayPlusSign, className, ...restProps }, ref) => {
    const dataProperties = toDataProperties({
      bold,
      positive: amount >= 0,
      negative: amount < 0,
      size,
    })

    return (
      <span {...restProps} {...dataProperties} className={classNames(CLASS_NAME, className)} ref={ref}>
        {displayPlusSign && '+'}
        {formatMoney(Math.abs(amount))}
      </span>
    )
  },
)
MoneySpan.displayName = 'MoneySpan'

export { MoneySpan }
