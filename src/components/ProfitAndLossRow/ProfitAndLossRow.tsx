import React, { useState } from 'react'
import ChevronDown from '../../icons/ChevronDown'
import { centsToDollars } from '../../models/Money'
import { Direction, LineItem } from '../../types'
import { Text, TextWeight } from '../Typography'

type Props = {
  variant?: string
  depth?: number
  maxDepth?: number
  lineItem?: LineItem | null
  direction?: Direction

  /* This removes the expand toggle and leaves everything in the expanded state */
  lockExpanded?: boolean
}

export const ProfitAndLossRow = ({
  variant,
  lineItem,
  depth = 0,
  maxDepth = 1,
  direction = Direction.DEBIT,
  lockExpanded = false,
}: Props) => {
  if (!lineItem) {
    return null
  }
  const { value, display_name, line_items } = lineItem
  const [expanded, setExpanded] = useState(true)
  const amount = value ?? 0
  const amountString = centsToDollars(Math.abs(amount))
  const labelClasses = [
    'Layer__profit-and-loss-row',
    'Layer__profit-and-loss-row__label',
  ]
  const valueClasses = [
    'Layer__profit-and-loss-row',
    'Layer__profit-and-loss-row__value',
  ]
  const positive =
    amount === 0 ||
    (direction === Direction.CREDIT && amount > 0) ||
    (direction === Direction.DEBIT && amount < 0)
  valueClasses.push(
    positive
      ? 'Layer__profit-and-loss-row__value--amount-positive'
      : 'Layer__profit-and-loss-row__value--amount-negative',
  )
  labelClasses.push(`Layer__profit-and-loss-row__label--depth-${depth}`)
  valueClasses.push(`Layer__profit-and-loss-row__value--depth-${depth}`)
  variant &&
    labelClasses.push(`Layer__profit-and-loss-row__label--variant-${variant}`)
  variant &&
    valueClasses.push(`Layer__profit-and-loss-row__value--variant-${variant}`)

  const toggleExpanded = () => setExpanded(!expanded)
  const canGoDeeper = depth < maxDepth
  const hasChildren = (line_items?.length ?? 0) > 0
  const displayChildren = hasChildren && canGoDeeper
  labelClasses.push(
    `Layer__profit-and-loss-row__label--display-children-${displayChildren}`,
  )
  valueClasses.push(
    `Layer__profit-and-loss-row__value--display-children-${displayChildren}`,
  )

  displayChildren &&
    expanded &&
    labelClasses.push('Layer__profit-and-loss-row__label--expanded')

  displayChildren &&
    expanded &&
    valueClasses.push('Layer__profit-and-loss-row__value--expanded')
  return (
    <>
      <div
        className={labelClasses.join(' ')}
        onClick={() => !lockExpanded && toggleExpanded()}
      >
        {!lockExpanded && <ChevronDown size={16} />}
        <Text>{display_name}</Text>
      </div>
      <div className={valueClasses.join(' ')}>
        <Text>{amountString}</Text>
      </div>
      {canGoDeeper && hasChildren && (
        <div
          className={`Layer__profit-and-loss-row__children ${
            expanded && 'Layer__profit-and-loss-row__children--expanded'
          }`}
        >
          <div className='Layer__profit-and-loss-row__children--content'>
            {(line_items || []).map(line_item => (
              <ProfitAndLossRow
                key={line_item.display_name}
                lineItem={line_item}
                depth={depth + 1}
                maxDepth={maxDepth}
                direction={direction}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
