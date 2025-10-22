import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import { centsToDollars as formatMoney } from '../../../models/Money'
import './moneySpan.scss'

const CLASS_NAME = 'Layer__MoneyText'

type MoneyTextProps = {
  amount: number
  bold?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  displayPlusSign?: boolean
} & Pick<ComponentPropsWithoutRef<'span'>, 'slot'>

const MoneySpan = forwardRef<HTMLSpanElement, MoneyTextProps>(
  ({ amount, bold, size, displayPlusSign, ...restProps }, ref) => {
    const dataProperties = toDataProperties({
      bold,
      positive: amount >= 0,
      negative: amount < 0,
      size,
    })

    return (
      <span {...restProps} {...dataProperties} className={CLASS_NAME} ref={ref}>
        {displayPlusSign && '+'}
        {formatMoney(Math.abs(amount))}
      </span>
    )
  },
)
MoneySpan.displayName = 'MoneySpan'

export { MoneySpan }
