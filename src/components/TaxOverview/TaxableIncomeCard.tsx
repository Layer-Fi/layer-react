import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { BREAKPOINTS } from '@utils/screenSizeBreakpoints'
import { useTaxOverview } from '@hooks/api/businesses/[business-id]/tax-estimates/overview/useTaxOverview'
import { useSizeClass, useWindowSize } from '@hooks/utils/size/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { Card } from '@components/Card/Card'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Loader } from '@components/Loader/Loader'
import { TaxEstimatesHeader, TaxEstimatesHeaderType } from '@components/TaxEstimates/TaxEstimatesHeader'
import { TaxEstimateMetricRow } from '@components/TaxOverview/TaxEstimateMetricRow'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

import './taxableIncomeCard.scss'

const LoadingState = () => <Loader />
const ErrorState = () => {
  const { t } = useTranslation()
  return (
    <DataState
      status={DataStateStatus.failed}
      title={t('taxEstimates:error.load_tax_estimates', 'We couldn\'t load your tax estimates')}
      description={t('taxEstimates:error.while_loading_tax_estimates', 'An error occurred while loading your tax estimates. Please check your connection and try again.')}
    />
  )
}

export const TaxableIncomeCard = () => {
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const [viewportWidth] = useWindowSize()
  const { isDesktop } = useSizeClass()
  const className = classNames({ 'Layer__TaxOverview__Card__MetricRow--mobile': !isDesktop })
  const isHeaderVisible = viewportWidth >= BREAKPOINTS.DESKTOP

  const { data: taxOverviewData, isLoading, isError } = useTaxOverview({
    year,
    fullYearProjection,
    enabled: true,
  })

  return (
    <Card className='Layer__TaxOverview__Card'>
      {isHeaderVisible && <TaxEstimatesHeader type={TaxEstimatesHeaderType.Overview} />}
      <ConditionalBlock
        data={taxOverviewData}
        isLoading={isLoading}
        isError={isError}
        Loading={<LoadingState />}
        Error={<ErrorState />}
      >
        {({ data }) => (
          <VStack pi={isDesktop ? 'md' : undefined}>
            <VStack className={className} gap='4xs'>
              {data.metrics.map((metric, index) => <TaxEstimateMetricRow key={`${metric.metricType}-${metric.label}-${index}`} metric={metric} />)}
            </VStack>
          </VStack>
        )}
      </ConditionalBlock>
    </Card>
  )
}
