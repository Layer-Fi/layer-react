import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import type { TaxOverviewData } from '@schemas/taxEstimates/overview'
import { useWindowSize } from '@hooks/utils/size/useWindowSize'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'
import { MetricRow } from '@components/MetricRow/MetricRow'

type TaxableIncomeCardProps = Pick<TaxOverviewData, 'deductionsTotal' | 'incomeTotal'> & {
  title?: string
  description?: string
  showHeader?: boolean
  headerAction?: ReactNode
}
const METRIC_ROW_MOBILE_BREAKPOINT = 600

export const TaxableIncomeCard = ({
  description,
  deductionsTotal,
  headerAction,
  incomeTotal,
  showHeader = true,
  title,
}: TaxableIncomeCardProps) => {
  const { t } = useTranslation()
  const [viewportWidth] = useWindowSize()
  const isMetricRowMobile = viewportWidth < METRIC_ROW_MOBILE_BREAKPOINT
  const maxMeterValue = Math.max(incomeTotal, deductionsTotal, 1)

  return (
    <Card className='Layer__TaxOverview__Card'>
      {showHeader && (
        <VStack gap='xs'>
          <HStack justify='space-between' align='start' gap='md'>
            <Heading level={2} size='md'>{title}</Heading>
            {headerAction}
          </HStack>
          <Span size='sm' variant='subtle'>{description}</Span>
        </VStack>
      )}
      <VStack gap={isMetricRowMobile ? 'sm' : 'md'}>
        <MetricRow
          label={t('taxEstimates:label.total_income', 'Total income')}
          amount={incomeTotal}
          classNamePrefix='Layer__TaxOverview'
          maxMeterValue={maxMeterValue}
          meterClassName='Layer__TaxOverview__IncomeMeter'
          isMobile={isMetricRowMobile}
        />
        <MetricRow
          label={t('taxEstimates:label.deductions', 'Deductions')}
          amount={deductionsTotal}
          classNamePrefix='Layer__TaxOverview'
          maxMeterValue={maxMeterValue}
          meterClassName='Layer__TaxOverview__DeductionsMeter'
          isMobile={isMetricRowMobile}
        />
      </VStack>
    </Card>
  )
}
