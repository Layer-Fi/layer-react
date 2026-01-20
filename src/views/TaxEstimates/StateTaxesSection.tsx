import { Table } from '@components/Table/Table'
import { TableBody } from '@components/TableBody/TableBody'
import { TableRow } from '@components/TableRow/TableRow'
import { TableCell } from '@components/TableCell/TableCell'
import { TableCellAlign } from '@internal-types/table'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Tooltip, TooltipTrigger, TooltipContent } from '@ui/Tooltip/Tooltip'
import { convertNumberToCurrency } from '@utils/format'
import { TaxEstimateDetailSection } from './TaxEstimateDetailSection'
import type { FederalTaxItem } from './TaxEstimateSummary'

interface StateTaxesSectionProps {
  items: FederalTaxItem[]
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
}

export const StateTaxesSection = ({
  items,
  expanded,
  onExpandedChange,
}: StateTaxesSectionProps) => {
  const totalItem = items.find(item => item.isTotal)
  const totalAmount = totalItem?.amount

  return (
    <TaxEstimateDetailSection
      title='Estimated State Taxes'
      totalAmount={totalAmount}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
    >
      <div className='Layer__tax-estimate__state-taxes-table'>
        <Table borderCollapse='collapse'>
          <TableBody>
            {items.map((item) => {
              if (item.isSeparator) {
                return (
                  <TableRow
                    key={item.id}
                    rowKey={item.id}
                  >
                    <TableCell colSpan={2} className='Layer__tax-estimate__separator-row' />
                  </TableRow>
                )
              }
              const isRate = item.label.includes('Rate')
              const displayAmount = isRate
                ? `${(item.amount! * 100).toFixed(2)}%`
                : item.amount !== undefined
                  ? convertNumberToCurrency(item.amount)
                  : ''

              return (
                <TableRow
                  key={item.id}
                  rowKey={item.id}
                >
                  <TableCell className={item.isDeduction ? 'Layer__tax-estimate__deduction-item' : ''}>
                    {item.isTotal
                      ? (
                        <Span size='md' className={item.isOwed ? 'Layer__tax-estimate__owed-label' : ''}>
                          {item.label}
                        </Span>
                      )
                      : (
                        <Span
                          size='md'
                          className={item.isOwed ? 'Layer__tax-estimate__owed-label' : item.isDeduction ? 'Layer__tax-estimate__deduction-item' : ''}
                        >
                          {item.label}
                        </Span>
                      )}
                  </TableCell>
                  <TableCell
                    align={TableCellAlign.RIGHT}
                    className={item.isTotal || item.isOwed ? 'Layer__tax-estimate__owed-amount' : ''}
                  >
                    {item.isTotal
                      ? (
                        item.formula
                          ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Heading size='md' className='Layer__tax-estimate__owed-amount'>
                                  {displayAmount}
                                </Heading>
                              </TooltipTrigger>
                              <TooltipContent>
                                <Span className='Layer__tax-estimate__tooltip' size='sm'>{item.formula}</Span>
                              </TooltipContent>
                            </Tooltip>
                          )
                          : (
                            <Heading size='md' className='Layer__tax-estimate__owed-amount'>
                              {displayAmount}
                            </Heading>
                          )
                      )
                      : (
                        item.formula
                          ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Span size='md' className={item.isOwed ? 'Layer__tax-estimate__owed-amount' : ''}>
                                  {displayAmount}
                                </Span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <Span className='Layer__tax-estimate__tooltip' size='sm'>{item.formula}</Span>
                              </TooltipContent>
                            </Tooltip>
                          )
                          : (
                            <Span size='md' className={item.isOwed ? 'Layer__tax-estimate__owed-amount' : ''}>
                              {displayAmount}
                            </Span>
                          )
                      )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </TaxEstimateDetailSection>
  )
}
