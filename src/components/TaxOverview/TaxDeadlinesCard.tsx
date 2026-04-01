import { useTranslation } from 'react-i18next'

import type { TaxOverviewData } from '@schemas/taxEstimates/overview'
import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Card } from '@components/Card/Card'
import type { TaxBannerReviewPayload } from '@components/TaxDetails/TaxBanner'
import { TaxOverviewDeadlineCard } from '@components/TaxOverview/TaxOverviewDeadlineCard'

type TaxDeadlinesCardProps = Pick<TaxOverviewData, 'annualDeadline' | 'paymentDeadlines'> & {
  onTaxBannerReviewClick?: (payload: TaxBannerReviewPayload) => void
}

export const TaxDeadlinesCard = ({
  annualDeadline,
  onTaxBannerReviewClick,
  paymentDeadlines,
}: TaxDeadlinesCardProps) => {
  const { t } = useTranslation()

  return (
    <Card className='Layer__TaxOverview__Card'>
      <VStack gap='lg'>
        <Heading level={2} size='md'>{t('taxEstimates:label.your_tax_deadlines', 'Your tax deadlines')}</Heading>
        <VStack gap='sm'>
          {paymentDeadlines.map(deadline => (
            <TaxOverviewDeadlineCard
              key={deadline.id}
              deadline={deadline}
              onTaxBannerReviewClick={onTaxBannerReviewClick}
            />
          ))}
          <TaxOverviewDeadlineCard
            key={annualDeadline.id}
            deadline={annualDeadline}
            onTaxBannerReviewClick={onTaxBannerReviewClick}
          />
        </VStack>
      </VStack>
    </Card>
  )
}
