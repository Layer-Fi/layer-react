import { useTranslation } from 'react-i18next'

import type { TaxOverviewDeadlineReview } from '@schemas/taxEstimates/overview'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Card } from '@components/Card/Card'
import { TaxOverviewDeadlineCard } from '@components/TaxOverview/TaxOverviewDeadlineCard'

import './taxDeadlinesCard.scss'

export type TaxDeadlinesCardProps = {
  onTaxBannerReviewClick?: (payload: TaxOverviewDeadlineReview['payload']) => void
}

export const TaxDeadlinesCard = ({
  onTaxBannerReviewClick,
}: TaxDeadlinesCardProps) => {
  const { t } = useTranslation()
  const { isDesktop } = useSizeClass()
  return (
    <Card className='Layer__TaxOverview__Card Layer__TaxOverview__Card--deadlines'>
      <VStack gap='lg'>
        <Heading size={!isDesktop ? 'sm' : 'md'}>{t('taxEstimates:label.your_tax_deadlines', 'Your tax deadlines')}</Heading>
        <VStack gap='sm'>
          {data.paymentDeadlines.map(deadline => (
            <TaxOverviewDeadlineCard
              key={deadline.id}
              data={deadline}
              onTaxBannerReviewClick={onTaxBannerReviewClick}
            />
          ))}
          <TaxOverviewDeadlineCard
            key={data.annualDeadline.id}
            data={data.annualDeadline}
            onTaxBannerReviewClick={onTaxBannerReviewClick}
          />
        </VStack>
      </VStack>
    </Card>
  )
}
