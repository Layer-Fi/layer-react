import React, { useEffect } from 'react'
import { useTableExpandRow } from '../../hooks/useTableExpandRow'
import ChevronDownFill from '../../icons/ChevronDownFill'
import { centsToDollars } from '../../models/Money'
import { LineItem } from '../../types'
import classNames from 'classnames'

type Props = {
  depth?: number
  maxDepth?: number
  lineItem?: LineItem | null
  variant?: string
  summarize?: boolean
  defaultExpanded?: boolean
}

export const BalanceSheetRow = ({
  lineItem,
  depth = 0,
  maxDepth = 4,
  variant,
  summarize = true,
  defaultExpanded = false,
}: Props) => {
  if (!lineItem) {
    return null
  }

  const { value, display_name, line_items } = lineItem
  const { isOpen, setIsOpen } = useTableExpandRow(0, defaultExpanded)
  const amount = value || 0
  const isPositive = amount >= 0
  const amountString = centsToDollars(Math.abs(amount))
  const canGoDeeper = depth < maxDepth
  const hasChildren = (line_items?.length ?? 0) > 0
  const displayChildren = hasChildren && canGoDeeper

  useEffect(() => {
    setIsOpen(defaultExpanded)
  }, [])

  const toggleExpanded = () => {
    if (variant === 'summation' || !displayChildren) return
    setIsOpen(!isOpen)
  }

  const rowClassNames = classNames([
    'Layer__balance-sheet-row',
    `Layer__balance-sheet-row--depth-${depth}`,
    variant && `Layer__balance-sheet-row--variant-${variant}`,
    displayChildren &&
      `Layer__balance-sheet-row--display-children-${
        !!line_items && depth < maxDepth
      }`,
    ,
    isOpen && 'Layer__balance-sheet-row--expanded',
    isOpen && depth + 1 >= maxDepth && 'Layer__balance-sheet-row--max-depth',
  ])

  const labelClassNames = classNames([
    'Layer__table-cell',
    'Layer__balance-sheet-cell__label',
  ])

  const valueClassNames = classNames([
    'Layer__table-cell',
    'Layer__balance-sheet-cell__value',
    isPositive && 'Layer__balance-sheet-cell__value--positive',
    !isPositive && 'Layer__balance-sheet-cell__value--negative',
  ])

  if (canGoDeeper && hasChildren) {
    return (
      <>
        {depth === 0 && displayChildren && (
          <tr className='Layer__table__empty-row'>
            <td colSpan={2} />
          </tr>
        )}
        <tr className={rowClassNames} onClick={toggleExpanded}>
          <td className={labelClassNames}>
            <span className='Layer__table-cell__content-wrapper'>
              <ChevronDownFill
                className='Layer__table__expand-icon'
                size={16}
                style={{
                  transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                }}
              />
              <span className='Layer__table-cell-content'>{display_name}</span>
            </span>
          </td>
          <td className={valueClassNames} />
        </tr>
        <>
          {isOpen &&
            canGoDeeper &&
            hasChildren &&
            (line_items || []).map((line_item, idx) => (
              <BalanceSheetRow
                key={`${line_item.display_name}_${idx}`}
                lineItem={line_item}
                depth={depth + 1}
                maxDepth={maxDepth}
              />
            ))}
          {summarize && (
            <BalanceSheetRow
              key={display_name}
              lineItem={{ value, display_name: `Total of ${display_name}` }}
              variant='summation'
              depth={depth}
              maxDepth={maxDepth}
            />
          )}
        </>
      </>
    )
  }

  return (
    <tr className={rowClassNames} onClick={toggleExpanded}>
      <td className={labelClassNames}>
        <span className='Layer__table-cell__active' />
        <span className='Layer__table-cell-content'>{display_name}</span>
      </td>
      <td className={valueClassNames}>
        <span className='Layer__table-cell-content'>{amountString}</span>
      </td>
    </tr>
  )
}
