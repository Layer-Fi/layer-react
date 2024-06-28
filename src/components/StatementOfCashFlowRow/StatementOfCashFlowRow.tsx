import React, { useEffect } from 'react'
import { useTableExpandRow } from '../../hooks/useTableExpandRow'
import ChevronDownFill from '../../icons/ChevronDownFill'
import { centsToDollars } from '../../models/Money'
import { LineItem } from '../../types'
import { ADJUSTMENTS_ROW_NAME } from '../StatementOfCashFlow/constants'
import classNames from 'classnames'

type Props = {
  depth?: number
  maxDepth?: number
  lineItem?: LineItem | null
  variant?: string
  summarize?: boolean
  defaultExpanded?: boolean
}

export const StatementOfCashFlowRow = ({
  lineItem,
  depth = 0,
  maxDepth = 10,
  variant = 'default',
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

  const toggleExpanded = () => {
    if (variant === 'summation' || !displayChildren) return
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    setIsOpen(defaultExpanded)
  }, [])

  const rowClassNames = classNames([
    'Layer__statement-of-cash-flow-row',
    `Layer__statement-of-cash-flow-row--depth-${depth}`,
    variant && `Layer__statement-of-cash-flow-row--variant-${variant}`,
    displayChildren &&
      `Layer__statement-of-cash-flow-row--display-children-${
        !!line_items && depth < maxDepth
      }`,
    ,
    isOpen && 'Layer__statement-of-cash-flow-row--expanded',
    isOpen &&
      depth + 1 >= maxDepth &&
      'Layer__statement-of-cash-flow-row--max-depth',
  ])

  const labelClassNames = classNames([
    'Layer__table-cell',
    'Layer__statement-of-cash-flow-cell__label',
  ])

  const valueClassNames = classNames([
    'Layer__table-cell',
    'Layer__statement-of-cash-flow-cell__value',
    isPositive && 'Layer__statement-of-cash-flow-cell__value--positive',
    !isPositive && 'Layer__statement-of-cash-flow-cell__value--negative',
  ])

  if (canGoDeeper && hasChildren) {
    return (
      <>
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
            (line_items || []).map((child_line_item, idx) => (
              <StatementOfCashFlowRow
                key={`${child_line_item.display_name}_${idx}`}
                lineItem={child_line_item}
                depth={depth + 1}
                maxDepth={maxDepth}
                summarize={child_line_item.name === ADJUSTMENTS_ROW_NAME}
              />
            ))}
          {summarize && (
            <StatementOfCashFlowRow
              key={display_name}
              lineItem={{ value, display_name: `Total of ${display_name}` }}
              variant='summation'
              depth={depth}
              maxDepth={maxDepth}
              summarize={false}
            />
          )}
        </>
      </>
    )
  }

  return (
    <>
      <tr className={rowClassNames} onClick={toggleExpanded}>
        <td className={labelClassNames}>
          <span className='Layer__table-cell-content'>{display_name}</span>
        </td>
        <td className={valueClassNames}>
          <span className='Layer__table-cell-content'>{amountString}</span>
        </td>
      </tr>
      {summarize && (
        <StatementOfCashFlowRow
          key={display_name}
          lineItem={{ value, display_name: `Total of ${display_name}` }}
          variant='summation'
          depth={depth}
          maxDepth={maxDepth}
          summarize={false}
        />
      )}
    </>
  )
}
