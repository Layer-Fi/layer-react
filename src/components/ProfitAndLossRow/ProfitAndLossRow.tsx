import React, { useState } from 'react'
import ChevronDown from '../../icons/ChevronDown'
import { centsToDollars } from '../../models/Money'
import { Direction, LineItem } from '../../types'

type Props = {
  variant?: string
  depth?: number
  maxDepth?: number
  lineItem?: LineItem | null
  direction?: Direction
  summarize?: boolean
}

export const ProfitAndLossRow = ({
  variant,
  lineItem,
  depth = 0,
  maxDepth = 1,
  direction = Direction.DEBIT,
  summarize = true,
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
      <div className={labelClasses.join(' ')} onClick={toggleExpanded}>
        <ChevronDown size={16} />
        {display_name}
      </div>
      <div className={valueClasses.join(' ')}>{amountString}</div>
      {canGoDeeper && hasChildren && (
        <div
          className={`Layer__profit-and-loss-row__children ${
            expanded && 'Layer__profit-and-loss-row__children--expanded'
          }`}
        >
          <div className='Layer__balance-sheet-row__children--content'>
            {(line_items || []).map(line_item => (
              <ProfitAndLossRow
                key={line_item.display_name}
                lineItem={line_item}
                depth={depth + 1}
                maxDepth={maxDepth}
                direction={direction}
              />
            ))}
            {summarize && (
              <ProfitAndLossRow
                key={display_name}
                lineItem={{ value, display_name: `Total of ${display_name}` }}
                variant='summation'
                depth={depth + 1}
                maxDepth={maxDepth}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}
