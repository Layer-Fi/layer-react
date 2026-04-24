import classNames from 'classnames'

import { BREAKPOINTS } from '@utils/screenSizeBreakpoints'
import { useTaxOverview } from '@hooks/api/businesses/[business-id]/tax-estimates/overview/useTaxOverview'
import { useSizeClass, useWindowSize } from '@hooks/utils/size/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { Card } from '@components/Card/Card'
import { TaxEstimatesHeader, TaxEstimatesHeaderType } from '@components/TaxEstimates/TaxEstimatesHeader'
import { TaxEstimateMetricRow } from '@components/TaxOverview/TaxEstimateMetricRow'

import './taxableIncomeCard.scss'

export const TaxableIncomeCard = () => {
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const [viewportWidth] = useWindowSize()
  const { isDesktop } = useSizeClass()
  const className = classNames({ 'Layer__TaxOverview__Card__MetricRow--mobile': !isDesktop })
  const isHeaderVisible = viewportWidth >= BREAKPOINTS.DESKTOP

  const { data: taxOverviewData } = useTaxOverview({
    year,
    fullYearProjection,
    enabled: true,
  })

  const metrics = taxOverviewData?.metrics ?? []
  return (
    <>
      <Card className='Layer__TaxOverview__Card'>
        {isHeaderVisible && <TaxEstimatesHeader type={TaxEstimatesHeaderType.Overview} />}
        <VStack pi={!isDesktop ? undefined : 'md'}>
          <VStack className={className} gap='4xs'>
            {metrics.map((metric, index) => <TaxEstimateMetricRow key={`${metric.metricType}-${metric.label}-${index}`} metric={metric} />)}
          </VStack>
        </VStack>
      </Card>
    </>
  )
}
