import { type ReactNode, useState } from 'react'
import classnames from 'classnames'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import ChevronDownFill from '@icons/ChevronDownFill'
import { Cell, Row } from '@ui/Table/Table'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

import './calculationTable.scss'

export type CalculationTableRowVariant =
  | 'standard'
  | 'nested'
  | 'section-total'
  | 'total'
  | 'empty'
  | 'bold'
  | 'indented'

type ExpandableConfig = {
  isExpanded: boolean
  onToggle: () => void
}

type CalculationTableRowProps = {
  label: string
  value: string | number
  variants: CalculationTableRowVariant[]
  sign?: string
  level?: number
  expandable?: ExpandableConfig
}

export const CalculationTableRow = ({ label, value, variants, sign, level = 0, expandable }: CalculationTableRowProps) => {
  const rowClickProps = expandable
    ? {
      'onAction': expandable.onToggle,
      'data-clickable': true,
    }
    : {}
  const { isMobile } = useSizeClass()
  const isEmpty = variants.includes('empty')
  const isIndented = variants.includes('indented')
  const className = classnames('Layer__CalculationTable__Row', isMobile && 'Layer__UI__Table-Row--mobile')
  const operator = sign ?? (variants.includes('section-total') ? '=' : undefined)

  const labelElement = <Span>{label}</Span>
  const valueElement = typeof value === 'number'
    ? <MoneySpan amount={value} />
    : <Span>{value}</Span>

  return (
    <Row
      className={className}
      data-variant={variants.join(' ')}
      data-level={level}
      {...rowClickProps}
    >
      <Cell>
        {!isEmpty && (
          <div className='Layer__CalculationTable__RowLabel'>
            {isIndented
              ? (
                <Span className='Layer__CalculationTable__OperatorBox'>{operator}</Span>
              )
              : (
                <span className='Layer__CalculationTable__ExpandSlot'>
                  {expandable && (
                    <button
                      type='button'
                      className='Layer__CalculationTable__GroupToggle'
                      onClick={(e) => {
                        e.stopPropagation()
                        expandable.onToggle()
                      }}
                      aria-label={expandable.isExpanded ? 'Collapse row' : 'Expand row'}
                    >
                      <ChevronDownFill
                        className={classnames(
                          'Layer__CalculationTable__GroupToggleIcon',
                          expandable.isExpanded
                            ? 'Layer__CalculationTable__GroupToggleIcon--expanded'
                            : 'Layer__CalculationTable__GroupToggleIcon--collapsed',
                        )}
                        size={14}
                      />
                    </button>
                  )}
                </span>
              )}
            {labelElement}
          </div>
        )}
      </Cell>
      <Cell>{!isEmpty && valueElement}</Cell>
    </Row>
  )
}

type CalculationTableGroupProps = {
  parent: {
    label: string
    value: string | number
  }
  children: ReactNode
  defaultExpanded?: boolean
  level?: number
}

export const CalculationTableGroup = ({ parent, children, defaultExpanded = true, level = 0 }: CalculationTableGroupProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  return (
    <>
      <CalculationTableRow
        label={parent.label}
        value={parent.value}
        variants={['standard']}
        level={level}
        expandable={{ isExpanded, onToggle: () => setIsExpanded(prev => !prev) }}
      />
      {isExpanded && children}
    </>
  )
}
