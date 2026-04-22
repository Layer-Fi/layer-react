import { useTranslation } from 'react-i18next'

import { useTaxEstimatesDeadlines } from '@hooks/api/businesses/[business-id]/tax-estimates/overview/useTaxDeadlines'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Card } from '@components/Card/Card'
import { TaxEstimatesDeadlineRow } from '@components/TaxEstimatesDeadlineRow/TaxEstimatesDeadlineRow'

import './taxDeadlinesCard.scss'

export const TaxDeadlinesCard = () => {
  const { t } = useTranslation()
  const { isDesktop } = useSizeClass()
  const { data } = useTaxEstimatesDeadlines()
  const paymentDeadlines = data.filter(deadline => deadline.type === 'quarter')
  const annualDeadline = data.find(deadline => deadline.type === 'annual')

  return (
    <Card className='Layer__TaxOverview__Card Layer__TaxOverview__Card--deadlines'>
      <VStack gap='lg'>
        <Heading size={!isDesktop ? 'sm' : 'md'}>{t('taxEstimates:label.your_tax_deadlines', 'Your tax deadlines')}</Heading>
        <VStack gap='2xs'>
          {paymentDeadlines.map(deadline => (
            <TaxEstimatesDeadlineRow
              key={deadline.dueDate.toString()}
              data={deadline}
            />
          ))}
          {annualDeadline && (
            <TaxEstimatesDeadlineRow
              key={annualDeadline.dueDate.toString()}
              data={annualDeadline}
              isAnnual
            />
          )}
        </VStack>
      </VStack>
    </Card>
  )
}
