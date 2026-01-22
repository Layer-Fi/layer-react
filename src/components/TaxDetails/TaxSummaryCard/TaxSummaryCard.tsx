import type { TaxSummary, TaxSummarySection } from '@schemas/taxEstimates/summary'
import { formatDate } from '@utils/format'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'

import './taxSummaryCard.scss'

type TaxSummarySectionRowProps = {
  section: TaxSummarySection
}

const TaxSummarySectionRow = ({ section }: TaxSummarySectionRowProps) => {
  const { isMobile } = useSizeClass()

  return (
    <VStack className='Layer__TaxSummaryCard__Section' gap='3xs'>
      <Span size={isMobile ? 'sm' : 'md'} variant='subtle'>{section.label}</Span>
      <HStack gap={isMobile ? 'sm' : 'md'} justify={isMobile ? 'space-between' : 'start'}>
        <MoneySpan size={isMobile ? 'lg' : 'xl'} weight='bold' amount={section.taxesOwed} />
        <Span size={isMobile ? 'sm' : 'md'} variant='subtle'>=</Span>
        <VStack gap='3xs' align='center'>
          <MoneySpan size={isMobile ? 'md' : 'lg'} amount={section.total} />
          <Span size={isMobile ? 'xs' : 'sm'} variant='subtle'>Taxes Owed</Span>
        </VStack>
        <Span size={isMobile ? 'sm' : 'md'} variant='subtle'>-</Span>
        <VStack gap='3xs' align='center'>
          <MoneySpan size={isMobile ? 'md' : 'lg'} amount={section.taxesPaid} />
          <Span size={isMobile ? 'xs' : 'sm'} variant='subtle'>Taxes Paid</Span>
        </VStack>
      </HStack>
    </VStack>
  )
}

type TaxSummaryCardProps = {
  data: TaxSummary
}

export const TaxSummaryCard = ({ data }: TaxSummaryCardProps) => {
  const { isDesktop } = useSizeClass()
  const Stack = isDesktop ? HStack : VStack

  return (
    <Card className='Layer__TaxSummaryCard'>
      <Stack className='Layer__TaxSummaryCard__Content'>
        <VStack className='Layer__TaxSummaryCard__Overview' gap='xs' justify='center' align='center'>
          <VStack justify='center' align='center'>
            <Span size='md' variant='subtle'>Projected Taxes Owed</Span>
            <MoneySpan size='xl' weight='bold' amount={data.projectedTaxesOwed} />
          </VStack>
          <VStack align='center'>
            <Span size='sm' variant='subtle'>Taxes Due</Span>
            <Span size='md'>{formatDate(data.taxesDueAt)}</Span>
          </VStack>
        </VStack>
        <VStack className='Layer__TaxSummaryCard__Breakdown' gap='md'>
          {data.sections.map(section => (
            <TaxSummarySectionRow key={section.label} section={section} />
          ))}
        </VStack>
      </Stack>
    </Card>
  )
}
