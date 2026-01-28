import type { TaxSummary } from '@schemas/taxEstimates/summary'
import { formatDate } from '@utils/format'
import { useFullYearProjection } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { maybeAddProjectedToLabel } from '@components/TaxEstimates/utils'

type TaxSummaryCardDesktopProps = {
  data: TaxSummary
}

export const TaxSummaryCardDesktop = ({ data }: TaxSummaryCardDesktopProps) => {
  const { fullYearProjection } = useFullYearProjection()

  return (
    <HStack className='Layer__TaxSummaryCard'>
      <VStack className='Layer__TaxSummaryCard__Overview' gap='xs' justify='center' align='center'>
        <VStack justify='center' align='center'>
          <Span size='md' variant='subtle'>{maybeAddProjectedToLabel('Taxes Owed', fullYearProjection)}</Span>
          <MoneySpan size='xl' weight='bold' amount={data.projectedTaxesOwed} />
        </VStack>
        <VStack align='center'>
          <Span size='sm' variant='subtle'>Taxes Due</Span>
          <Span size='md'>{formatDate(data.taxesDueAt)}</Span>
        </VStack>
      </VStack>
      <VStack className='Layer__TaxSummaryCard__Breakdown'>
        <div className='Layer__TaxSummaryCard__Grid'>
          {data.sections.map(section => (
            <div key={section.label} className='Layer__TaxSummaryCard__SectionGroup'>
              <Span size='md' variant='subtle'>{section.label}</Span>
              <MoneySpan size='xl' weight='bold' amount={section.taxesOwed} />
              <Span size='md' variant='subtle'>=</Span>
              <MoneySpan size='lg' amount={section.total} />
              <Span size='md' variant='subtle'>-</Span>
              <MoneySpan size='lg' amount={section.taxesPaid} />
              <span />
              <span />
              <Span size='sm' variant='subtle'>Total</Span>
              <span />
              <Span size='sm' variant='subtle'>Taxes Paid</Span>
            </div>
          ))}
        </div>
      </VStack>
    </HStack>
  )
}
