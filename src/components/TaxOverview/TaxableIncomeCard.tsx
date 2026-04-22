import { type TaxOverviewMetric } from '@schemas/taxEstimates/overview'
import { useTaxOverview } from '@hooks/api/businesses/[business-id]/tax-estimates/overview/useTaxOverview'
import { useSizeClass, useWindowSize } from '@hooks/utils/size/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { Card } from '@components/Card/Card'
import { TaxEstimatesHeader, TaxEstimatesHeaderType } from '@components/TaxEstimates/TaxEstimatesHeader'
import { TaxEstimateMetricRow } from '@components/TaxOverview/TaxEstimateMetricRow'

import './taxableIncomeCard.scss'

const DesktopContent = ({ metrics }: { metrics: TaxOverviewMetric[] }) => {
  return (
    <VStack gap='4xs'>
      {metrics.map((metric, index) => <TaxEstimateMetricRow key={`${metric.metricType}-${metric.label}-${index}`} metric={metric} />)}
    </VStack>
  )
}

const MobileContent = ({ metrics }: { metrics: TaxOverviewMetric[] }) => {
  return (
    <VStack className='Layer__TaxOverview__Card__MetricRow--mobile' gap='4xs'>
      {metrics.map((metric, index) => <TaxEstimateMetricRow key={`${metric.metricType}-${metric.label}-${index}`} metric={metric} />)}
    </VStack>
  )
}

const Content = ({ metrics }: { metrics: TaxOverviewMetric[] }) => {
  const { isDesktop } = useSizeClass()
  return isDesktop ? <DesktopContent metrics={metrics} /> : <MobileContent metrics={metrics} />
}

export const TaxableIncomeCard = () => {
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const [viewportWidth] = useWindowSize()
  const { isDesktop } = useSizeClass()
  const { data: taxOverviewData } = useTaxOverview({
    year,
    fullYearProjection,
    enabled: true,
  })

  const metrics = taxOverviewData?.metrics ?? []
  const isHeaderVisible = viewportWidth > 1200
  return (
    <>
      <Card className='Layer__TaxOverview__Card'>
        {isHeaderVisible && <TaxEstimatesHeader type={TaxEstimatesHeaderType.Overview} />}
        <VStack pi={!isDesktop ? undefined : 'md'}>
          <Content metrics={Array.from(metrics)} />
        </VStack>
      </Card>
    </>
  )
}
