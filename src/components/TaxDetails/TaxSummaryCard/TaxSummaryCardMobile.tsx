import type { TaxSummary } from '@schemas/taxEstimates/summary'
import { formatDate } from '@utils/format'
import { useFullYearProjection } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'
import { maybeAddProjectedToLabel } from '@components/TaxEstimates/utils'

type TaxSummaryCardMobileProps = {
  data: TaxSummary
}

export const TaxSummaryCardMobile = ({ data }: TaxSummaryCardMobileProps) => {
  const { fullYearProjection } = useFullYearProjection()

  return (
    <VStack className='Layer__TaxSummaryCard--mobile' gap='md'>
      <Card className='Layer__TaxSummaryCard__OverviewCard'>
        <VStack gap='xs' justify='center' align='center'>
          <VStack justify='center' align='center'>
            <Span size='md' variant='subtle'>{maybeAddProjectedToLabel('Taxes Owed', fullYearProjection)}</Span>
            <MoneySpan size='xl' weight='bold' amount={data.projectedTaxesOwed} />
          </VStack>
          <VStack align='center'>
            <Span size='sm' variant='subtle'>Taxes Due</Span>
            <Span size='md'>{formatDate(data.taxesDueAt)}</Span>
          </VStack>
        </VStack>
      </Card>
      <Card className='Layer__TaxSummaryCard__BreakdownCard'>
        <div className='Layer__TaxSummaryCard__Grid Layer__TaxSummaryCard__Grid--mobile'>
          {data.sections.map(section => (
            <div key={section.label} className='Layer__TaxSummaryCard__SectionGroup'>
              <Span size='sm' variant='subtle'>{section.label}</Span>
              <MoneySpan size='lg' weight='bold' amount={section.taxesOwed} />
              <Span size='sm' variant='subtle'>=</Span>
              <MoneySpan size='md' amount={section.total} />
              <Span size='sm' variant='subtle'>-</Span>
              <MoneySpan size='md' amount={section.taxesPaid} />
              <span />
              <span />
              <Span size='sm' variant='subtle'>Total</Span>
              <span />
              <Span size='sm' variant='subtle'>Taxes Paid</Span>
            </div>
          ))}
        </div>
      </Card>
    </VStack>
  )
}
