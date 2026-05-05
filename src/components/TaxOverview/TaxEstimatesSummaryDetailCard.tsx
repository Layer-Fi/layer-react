import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import type { TaxOverviewLineItem, TaxOverviewSection } from '@schemas/taxEstimates/overview'
import { useTaxOverview } from '@hooks/api/businesses/[business-id]/tax-estimates/overview/useTaxOverview'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useWindowSize } from '@hooks/utils/size/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Loader } from '@components/Loader/Loader'
import { TaxEstimatesHeader, TaxEstimatesHeaderType } from '@components/TaxEstimates/TaxEstimatesHeader'
import { resolveCategoryColor } from '@components/TaxEstimatesSummaryCard/constants'
import { TAX_OVERVIEW_MOBILE_BREAKPOINT } from '@components/TaxOverview/constants'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

import './taxEstimatesSummaryDetailCard.scss'

const EM_DASH = '—'

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

function LineItemRow({ item }: { item: TaxOverviewLineItem }) {
  const isSubtotal = item.variant === 'subtotal'
  const isSubtle = item.variant === 'subtle'
  const rowClassName = classNames(
    'Layer__TaxEstimatesSummaryDetailCard__LineItem',
    isSubtotal && 'Layer__TaxEstimatesSummaryDetailCard__LineItem--subtotal',
  )
  const labelClassName = classNames(
    'Layer__TaxEstimatesSummaryDetailCard__LineItemLabel',
    isSubtotal && 'Layer__TaxEstimatesSummaryDetailCard__LineItemLabel--subtotal',
  )
  const labelVariant = isSubtle ? 'subtle' as const : undefined

  return (
    <HStack className={rowClassName} justify='space-between' align='center' gap='md'>
      <Span size='md' variant={labelVariant} className={labelClassName}>{item.label}</Span>
      {item.amount === null || item.amount === undefined
        ? <Span size='md' variant='subtle'>{EM_DASH}</Span>
        : <MoneySpan size='md' weight={isSubtotal ? 'bold' : undefined} amount={item.amount} />}
    </HStack>
  )
}

function TaxSectionColumn({ section }: { section: TaxOverviewSection }) {
  const dotColor = resolveCategoryColor({ key: section.type })

  return (
    <VStack className='Layer__TaxEstimatesSummaryDetailCard__Section'>
      <HStack className='Layer__TaxEstimatesSummaryDetailCard__SectionHeader' justify='space-between' align='center'>
        <Span size='sm' variant='subtle' className='Layer__TaxEstimatesSummaryDetailCard__SectionLabel'>{section.label}</Span>
        <span
          className='Layer__TaxEstimatesSummaryDetailCard__SectionDot'
          style={{ backgroundColor: dotColor }}
          aria-hidden='true'
        />
      </HStack>
      {section.lineItems.map((item, index) => (
        <LineItemRow key={`${section.type}-${item.label}-${index}`} item={item} />
      ))}
    </VStack>
  )
}

export const TaxEstimatesSummaryDetailCard = () => {
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const { formatCurrencyFromCents } = useIntlFormatter()
  const [viewportWidth] = useWindowSize()
  const isHeaderVisible = viewportWidth >= TAX_OVERVIEW_MOBILE_BREAKPOINT

  const { data: taxOverviewData, isLoading, isError } = useTaxOverview({
    year,
    fullYearProjection,
    enabled: true,
  })

  return (
    <Card className='Layer__TaxOverview__Card Layer__TaxEstimatesSummaryDetailCard'>
      {isHeaderVisible && <TaxEstimatesHeader type={TaxEstimatesHeaderType.Overview} />}
      <ConditionalBlock
        data={taxOverviewData}
        isLoading={isLoading}
        isError={isError}
        Loading={<LoadingState />}
        Error={<ErrorState />}
      >
        {({ data }) => (
          <VStack className='Layer__TaxEstimatesSummaryDetailCard__Body' gap='md'>
            <Heading size='xl' weight='bold' className='Layer__TaxEstimatesSummaryDetailCard__Total'>
              {formatCurrencyFromCents(data.totalTaxesOwed)}
            </Heading>
            <div className='Layer__TaxEstimatesSummaryDetailCard__Divider' />
            <div className='Layer__TaxEstimatesSummaryDetailCard__Sections'>
              {data.taxSections.map(section => (
                <TaxSectionColumn key={section.type} section={section} />
              ))}
            </div>
          </VStack>
        )}
      </ConditionalBlock>
    </Card>
  )
}
