import { useTranslation } from 'react-i18next'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useTaxEstimatesDeadlines } from '@hooks/features/taxEstimates/useTaxEstimatesDeadlines'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'
import { Card } from '@ui/Card/Card'
import { SkeletonLoader } from '@ui/SkeletonLoader/SkeletonLoader'
import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { TaxEstimatesDeadlineRow } from '@features/taxEstimates/TaxEstimatesDeadlineRow/TaxEstimatesDeadlineRow'

import './taxDeadlinesCard.scss'

const LoadingState = () => {
  const { t } = useTranslation()
  const { isDesktop } = useSizeClass()
  return (
    <Card className='Layer__TaxOverview__Card Layer__TaxOverview__Card--deadlines'>
      <VStack gap='lg'>
        <Heading size={isDesktop ? 'md' : 'sm'}>{t('taxEstimates:TaxDeadlinesCard.label.your_tax_deadlines', 'Your tax deadlines')}</Heading>
        <SkeletonLoader height='72px' width='100%' />
        <SkeletonLoader height='72px' width='100%' />
        <SkeletonLoader height='72px' width='100%' />
        <SkeletonLoader height='72px' width='100%' />
        <SkeletonLoader height='72px' width='100%' />
      </VStack>
    </Card>
  )
}

const ErrorState = () => {
  const { t } = useTranslation()
  const { isDesktop } = useSizeClass()
  return (
    <Card className='Layer__TaxOverview__Card Layer__TaxOverview__Card--deadlines'>
      <VStack gap='lg'>
        <Heading size={isDesktop ? 'md' : 'sm'}>{t('taxEstimates:TaxDeadlinesCard.label.your_tax_deadlines', 'Your tax deadlines')}</Heading>
        <Span size='md'>
          {t('taxEstimates:TaxDeadlinesCard.error.load_tax_deadlines', 'We couldn’t load your tax deadlines')}
        </Span>
      </VStack>
    </Card>
  )
}

export const TaxDeadlinesCard = () => {
  const { t } = useTranslation()
  const { isDesktop } = useSizeClass()
  const { data, isLoading, isError } = useTaxEstimatesDeadlines()
  return (
    <ConditionalBlock data={data} isLoading={isLoading} isError={isError} Loading={<LoadingState />} Error={<ErrorState />}>
      {({ data }) => {
        const paymentDeadlines = data.filter(deadline => deadline.type === 'quarter')
        const annualDeadline = data.find(deadline => deadline.type === 'annual')

        return (
          <Card className='Layer__TaxOverview__Card Layer__TaxOverview__Card--deadlines'>
            <VStack gap='lg'>
              <Heading size={isDesktop ? 'md' : 'sm'}>{t('taxEstimates:TaxDeadlinesCard.label.your_tax_deadlines', 'Your tax deadlines')}</Heading>
              <VStack gap='2xs'>
                {paymentDeadlines.map(deadline => (
                  <TaxEstimatesDeadlineRow
                    key={deadline.title}
                    data={deadline}
                  />
                ))}
                {annualDeadline && (
                  <TaxEstimatesDeadlineRow
                    key='annual'
                    data={annualDeadline}
                  />
                )}
              </VStack>
            </VStack>
          </Card>
        )
      }}
    </ConditionalBlock>
  )
}
