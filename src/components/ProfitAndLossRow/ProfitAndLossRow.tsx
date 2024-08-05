import React, { useState } from 'react'
import { SidebarScope } from '../../hooks/useProfitAndLoss/useProfitAndLoss'
import ChevronDownFill from '../../icons/ChevronDownFill'
import PieChart from '../../icons/PieChart'
import { centsToDollars } from '../../models/Money'
import { Direction, LineItem } from '../../types'
import { Text } from '../Typography'

type Props = {
  variant?: string
  depth?: number
  maxDepth?: number
  lineItem?: LineItem | null
  direction?: Direction
  scope?: SidebarScope
  setSidebarScope?: (name: SidebarScope) => void
  defaultExpanded?: boolean

  /* This removes the expand toggle and leaves everything in the expanded state */
  lockExpanded?: boolean
}

export const ProfitAndLossRow = ({
  variant,
  lineItem,
  depth = 0,
  maxDepth = 8,
  direction = Direction.DEBIT,
  lockExpanded = false,
  scope,
  setSidebarScope,
  defaultExpanded = false,
}: Props) => {
  if (!lineItem) {
    return null
  }
  const { value, display_name, line_items } = lineItem
  const [expanded, setExpanded] = useState(lockExpanded || defaultExpanded)
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
        style={{ paddingLeft: 16 * (depth + 1) }}
      >
        <span className='Layer__profit-and-loss-row__label__title'>
          {!lockExpanded && variant !== 'summation' ? (
            <ChevronDownFill
              size={16}
              className='Layer__profit-and-loss-row__label__chevron'
            />
          ) : null}
          <Text>{display_name}</Text>
        </span>
        {setSidebarScope && (
          <span
            className='Layer__profit-and-loss-row__detailed-chart-btn'
            onClick={e => {
              e.stopPropagation()
              setSidebarScope && setSidebarScope(scope ?? 'expenses')
            }}
          >
            <PieChart />
          </span>
        )}
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
