import React from 'react'
import { centsToDollars } from '../../models/Money'
import { LineItem } from '../../types/profit_and_loss'
import { ProfitAndLossRow } from '../ProfitAndLossRow'

type Props = {
  variant?: string
  depth?: number
  maxDepth?: number
  lineItem: LineItem
}

export const ProfitAndLossRow = ({
  variant,
  lineItem,
  depth = 0,
  maxDepth = 1,
}: Props) => {
  if (!lineItem) {
    return null
  }
  const { value, display_name, line_items, name } = lineItem
  const variantName = variant || name
  const amount = value || 0
  const amountString = centsToDollars(Math.abs(amount))
  const labelClasses = [
    'Layer__profit-and-loss-row',
    'Layer__profit-and-loss-row__label',
  ]
  const valueClasses = [
    'Layer__profit-and-loss-row',
    'Layer__profit-and-loss-row__value',
  ]
  valueClasses.push(
    amount >= 0
      ? 'Layer__profit-and-loss-row__value--amount-positive'
      : 'Layer__profit-and-loss-row__value--amount-negative',
  )
  depth > 0 &&
    labelClasses.push(`Layer__profit-and-loss-row__label--depth-${depth}`)
  depth > 0 &&
    valueClasses.push(`Layer__profit-and-loss-row__value--depth-${depth}`)
  variantName &&
    labelClasses.push(
      `Layer__profit-and-loss-row__label--variant-${variantName}`,
    )
  variantName &&
    valueClasses.push(
      `Layer__profit-and-loss-row__value--variant-${variantName}`,
    )
  return (
    <>
      <div className={labelClasses.join(' ')}>{display_name}</div>
      <div className={valueClasses.join(' ')}>{amountString}</div>
      {depth < maxDepth &&
        (line_items || []).map(line_item => (
          <ProfitAndLossRow
            key={line_item.name}
            lineItem={line_item}
            depth={depth + 1}
            maxDepth={maxDepth}
          />
        ))}
    </>
  )
}


