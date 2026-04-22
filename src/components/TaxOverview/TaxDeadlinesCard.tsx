import { useTranslation } from 'react-i18next'

import { type TaxOverviewBannerReview } from '@schemas/taxEstimates/overview'
import { useTaxEstimatesDeadlines } from '@hooks/api/businesses/[business-id]/tax-estimates/overview/useTaxDeadlines'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Card } from '@components/Card/Card'
import { TaxEstimatesDeadlineRow } from '@components/TaxEstimatesDeadlineRow/TaxEstimatesDeadlineRow'

import './taxDeadlinesCard.scss'

export type TaxDeadlinesCardProps = {
  onTaxBannerReviewClick?: (payload: TaxOverviewBannerReview) => void
}

export const TaxDeadlinesCard = ({
  onTaxBannerReviewClick,
}: TaxDeadlinesCardProps) => {
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
              key={deadline.dueDate.toISOString()}
              data={deadline}
              onTaxBannerReviewClick={onTaxBannerReviewClick}
            />
          ))}
          {annualDeadline && (
            <TaxEstimatesDeadlineRow
              key={annualDeadline.dueDate.toISOString()}
              data={annualDeadline}
              onTaxBannerReviewClick={onTaxBannerReviewClick}
            />
          )}
        </VStack>
      </VStack>
    </Card>
  )
}
