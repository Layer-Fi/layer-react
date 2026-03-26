import classnames from 'classnames'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
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

type TaxTableRowProps = {
  label: string
  value: string | number
  variant: TaxTableRowVariant
  sign?: string
}

const VARIANT_CLASS_MAP: Record<TaxTableRowVariant, string> = {
  [TaxTableRowVariant.Standard]: 'Layer__TaxTable__Row',
  [TaxTableRowVariant.Nested]: 'Layer__TaxTable__Row Layer__TaxTable__Row--nested',
  [TaxTableRowVariant.SectionTotal]: 'Layer__TaxTable__Row Layer__TaxTable__Row--section-total',
  [TaxTableRowVariant.Total]: 'Layer__TaxTable__Row Layer__TaxTable__Row--total',
  [TaxTableRowVariant.Empty]: 'Layer__TaxTable__Row Layer__TaxTable__Row--empty',
}

const BOLD_VARIANTS = new Set([TaxTableRowVariant.SectionTotal, TaxTableRowVariant.Total])

export const TaxTableRow = ({ label, value, variant, sign }: TaxTableRowProps) => {
  const { isMobile } = useSizeClass()
  const isEmpty = variant === TaxTableRowVariant.Empty
  const isNested = variant === TaxTableRowVariant.Nested
  const isBold = BOLD_VARIANTS.has(variant)
  const mobileClass = isMobile ? 'Layer__UI__Table-Row--mobile' : ''
  const className = classnames(VARIANT_CLASS_MAP[variant], mobileClass)

  const labelElement = isBold ? <Span weight='bold'>{label}</Span> : <Span>{label}</Span>
  const valueElement = typeof value === 'number'
    ? <MoneySpan weight={isBold ? 'bold' : undefined} amount={value} />
    : <Span weight={isBold ? 'bold' : undefined}>{value}</Span>

  const labelContent = isNested && sign
    ? (
      <div className='Layer__TaxTable__LabelWithIcon'>
        <span className='Layer__TaxTable__IconCell'>
          <span className='Layer__TaxTable__Icon'>{sign}</span>
        </span>
        <span className='Layer__TaxTable__Separator' />
        <span className='Layer__TaxTable__Label'>{labelElement}</span>
      </div>
    )
    : labelElement

  return (
    <Row className={className}>
      <Cell>{!isEmpty && labelContent}</Cell>
      <Cell>{!isEmpty && valueElement}</Cell>
    </Row>
  )
}
