import { type ReactNode, useState } from 'react'
import classnames from 'classnames'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import ChevronDownFill from '@icons/ChevronDownFill'
import { Cell, Row } from '@ui/Table/Table'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

import './TaxTable.scss'

export enum TaxTableRowVariant {
  Standard = 'standard',
  Nested = 'nested',
  SectionTotal = 'section-total',
  Total = 'total',
  Empty = 'empty',
}

type ExpandableConfig = {
  isExpanded: boolean
  onToggle: () => void
}

type TaxTableRowProps = {
  label: string
  value: string | number
  variant: TaxTableRowVariant
  sign?: string
  level?: number
  expandable?: ExpandableConfig
}

const VARIANT_CLASS_MAP: Record<TaxTableRowVariant, string> = {
  [TaxTableRowVariant.Standard]: 'Layer__TaxTable__Row',
  [TaxTableRowVariant.Nested]: 'Layer__TaxTable__Row Layer__TaxTable__Row--nested',
  [TaxTableRowVariant.SectionTotal]: 'Layer__TaxTable__Row Layer__TaxTable__Row--section-total',
  [TaxTableRowVariant.Total]: 'Layer__TaxTable__Row Layer__TaxTable__Row--total',
  [TaxTableRowVariant.Empty]: 'Layer__TaxTable__Row Layer__TaxTable__Row--empty',
}

const BOLD_VARIANTS = new Set([TaxTableRowVariant.SectionTotal, TaxTableRowVariant.Total])
const LEVEL_1_VARIANTS = new Set([TaxTableRowVariant.Nested, TaxTableRowVariant.SectionTotal])

export const TaxTableRow = ({ label, value, variant, sign, level, expandable }: TaxTableRowProps) => {
  const rowClickProps = expandable
    ? {
      'onAction': expandable.onToggle,
      'data-clickable': true,
    }
    : {}
  const { isMobile } = useSizeClass()
  const isEmpty = variant === TaxTableRowVariant.Empty
  const isBold = BOLD_VARIANTS.has(variant)
  const isLevel1 = LEVEL_1_VARIANTS.has(variant)
  const mobileClass = isMobile ? 'Layer__UI__Table-Row--mobile' : ''
  const className = classnames(VARIANT_CLASS_MAP[variant], mobileClass)
  const operator = sign ?? (variant === TaxTableRowVariant.SectionTotal ? '=' : undefined)

  const labelElement = isBold ? <Span weight='bold'>{label}</Span> : <Span>{label}</Span>
  const valueElement = typeof value === 'number'
    ? <MoneySpan weight={isBold ? 'bold' : undefined} amount={value} />
    : <Span weight={isBold ? 'bold' : undefined}>{value}</Span>

  return (
    <Row className={className} data-level={level} {...rowClickProps}>
      <Cell>
        {!isEmpty && (
          <div className='Layer__TaxTable__RowLabel'>
            {isLevel1
              ? (
                <span className='Layer__TaxTable__OperatorBox'>{operator}</span>
              )
              : (
                <span className='Layer__TaxTable__ExpandSlot'>
                  {expandable && (
                    <button
                      type='button'
                      className='Layer__TaxTable__GroupToggle'
                      onClick={(e) => {
                        e.stopPropagation()
                        expandable.onToggle()
                      }}
                      aria-label={expandable.isExpanded ? 'Collapse row' : 'Expand row'}
                    >
                      <ChevronDownFill
                        className={classnames(
                          'Layer__TaxTable__GroupToggleIcon',
                          expandable.isExpanded
                            ? 'Layer__TaxTable__GroupToggleIcon--expanded'
                            : 'Layer__TaxTable__GroupToggleIcon--collapsed',
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

type TaxTableGroupProps = {
  parent: {
    label: string
    value: string | number
  }
  children: ReactNode
  defaultExpanded?: boolean
  level?: number
}

export const TaxTableGroup = ({ parent, children, defaultExpanded = true, level = 0 }: TaxTableGroupProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  return (
    <>
      <TaxTableRow
        label={parent.label}
        value={parent.value}
        variant={TaxTableRowVariant.Standard}
        level={level}
        expandable={{ isExpanded, onToggle: () => setIsExpanded(prev => !prev) }}
      />
      {isExpanded && children}
    </>
  )
}
