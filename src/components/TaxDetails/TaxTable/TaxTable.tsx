import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
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
}

const VARIANT_CLASS_MAP: Record<TaxTableRowVariant, string> = {
  [TaxTableRowVariant.Standard]: 'Layer__TaxTable__Row',
  [TaxTableRowVariant.Nested]: 'Layer__TaxTable__Row Layer__TaxTable__Row--nested',
  [TaxTableRowVariant.SectionTotal]: 'Layer__TaxTable__Row Layer__TaxTable__Row--section-total',
  [TaxTableRowVariant.Total]: 'Layer__TaxTable__Row Layer__TaxTable__Row--total',
  [TaxTableRowVariant.Empty]: 'Layer__TaxTable__Row Layer__TaxTable__Row--empty',
}

const BOLD_VARIANTS = new Set([TaxTableRowVariant.SectionTotal, TaxTableRowVariant.Total])

export const TaxTableRow = ({ label, value, variant }: TaxTableRowProps) => {
  const { isMobile } = useSizeClass()
  const isEmpty = variant === TaxTableRowVariant.Empty
  const isBold = BOLD_VARIANTS.has(variant)
  const mobileClass = isMobile ? 'Layer__UI__Table-Row--mobile' : ''
  const className = `${VARIANT_CLASS_MAP[variant]} ${mobileClass}`.trim()

  const labelElement = isBold ? <Span weight='bold'>{label}</Span> : <Span>{label}</Span>
  const valueElement = typeof value === 'number'
    ? <MoneySpan weight={isBold ? 'bold' : undefined} amount={value} />
    : <Span weight={isBold ? 'bold' : undefined}>{value}</Span>

  return (
    <Row className={className}>
      <Cell>{!isEmpty && labelElement}</Cell>
      <Cell>{!isEmpty && valueElement}</Cell>
    </Row>
  )
}
