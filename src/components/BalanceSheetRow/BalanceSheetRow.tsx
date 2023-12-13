import React, { useState } from 'react'
import ChevronDown from '../../icons/ChevronDown'
import { centsToDollars } from '../../models/Money'
import { LineItem } from '../../types'

type Props = {
  depth?: number
  maxDepth?: number
  lineItem?: LineItem | null
  variant?: string
  summarize?: boolean
}

export const BalanceSheetRow = ({
  lineItem,
  depth = 0,
  maxDepth = 2,
  variant,
  summarize = true,
}: Props) => {
  if (!lineItem) {
    return null
  }
  const { value, display_name, line_items } = lineItem
  const [expanded, setExpanded] = useState(true)
  const amount = value || 0
  const isPositive = amount >= 0
  const amountString = centsToDollars(Math.abs(amount))
  const labelClasses = [
    'Layer__balance-sheet-row',
    'Layer__balance-sheet-row__label',
  ]
  const valueClasses = [
    'Layer__balance-sheet-row',
    'Layer__balance-sheet-row__value',
  ]
  !!value &&
    valueClasses.push(
      isPositive
        ? 'Layer__balance-sheet-row__value--amount-positive'
        : 'Layer__balance-sheet-row__value--amount-negative',
    )
  labelClasses.push(`Layer__balance-sheet-row__label--depth-${depth}`)
  valueClasses.push(`Layer__balance-sheet-row__value--depth-${depth}`)

  variant &&
    labelClasses.push(`Layer__balance-sheet-row__label--variant-${variant}`)
  variant &&
    valueClasses.push(`Layer__balance-sheet-row__value--variant-${variant}`)

  const toggleExpanded = () => setExpanded(!expanded)
  const canGoDeeper = depth < maxDepth
  const hasChildren = line_items?.length > 0
  const displayChildren = hasChildren && canGoDeeper
  labelClasses.push(
    `Layer__balance-sheet-row__label--display-children-${displayChildren}`,
  )
  valueClasses.push(
    `Layer__balance-sheet-row__value--display-children-${displayChildren}`,
  )

  displayChildren &&
    expanded &&
    labelClasses.push(`Layer__balance-sheet-row__label--expanded`)

  displayChildren &&
    expanded &&
    valueClasses.push(`Layer__balance-sheet-row__value--expanded`)

  return (
    <>
      <div className={labelClasses.join(' ')} onClick={toggleExpanded}>
        <ChevronDown size={16} />
        {display_name}
      </div>
      <div className={valueClasses.join(' ')}>{!!value && amountString}</div>
      {canGoDeeper && hasChildren && (
        <div
          className={`Layer__balance-sheet-row__children ${
            expanded && 'Layer__balance-sheet-row__children--expanded'
          }`}
        >
          <div className="Layer__balance-sheet-row__children--content">
            {(line_items || []).map(line_item => (
              <BalanceSheetRow
                key={line_item.display_name}
                lineItem={line_item}
                depth={depth + 1}
                maxDepth={maxDepth}
              />
            ))}
            {summarize && (
              <BalanceSheetRow
                key={display_name}
                lineItem={{ value, display_name: `Total of ${display_name}` }}
                variant="summation"
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
