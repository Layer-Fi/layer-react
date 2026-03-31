import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { TaxEstimatesBanner, TaxEstimatesBannerQuarter } from '@schemas/taxEstimates/banner'
import type { TaxSummary } from '@schemas/taxEstimates/summary'
import { tConditional } from '@utils/i18n/conditional'
import { DateFormat } from '@utils/i18n/date/patterns'
import { useTaxEstimatesBanner } from '@hooks/api/businesses/[business-id]/tax-estimates/banner/useTaxEstimatesBanner'
import { useTaxSummary } from '@hooks/api/businesses/[business-id]/tax-estimates/summary/useTaxSummary'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Loader } from '@components/Loader/Loader'
import { ResponsiveDetailView } from '@components/ResponsiveDetailView/ResponsiveDetailView'
import { TaxEstimatesHeader } from '@components/TaxEstimates/TaxEstimatesHeader'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

type TaxOverviewData = {
  summary: TaxSummary
  banner: TaxEstimatesBanner
  nextQuarter: TaxEstimatesBannerQuarter | null
}

const getNextQuarter = (banner: TaxEstimatesBanner): TaxEstimatesBannerQuarter | null => {
  const nextQuarter = banner.quarters.find(quarter => !quarter.isPastDue && quarter.amountOwed > 0)
    ?? banner.quarters.find(quarter => quarter.amountOwed > 0)
    ?? banner.quarters[0]

  return nextQuarter ?? null
}

const TaxOverviewHeader = ({ isMobile }: { isMobile: boolean }) => {
  const { t } = useTranslation()
  const { fullYearProjection } = useFullYearProjection()
  const projectedCondition: 'default' | 'projected' = fullYearProjection ? 'projected' : 'default'

  return (
    <TaxEstimatesHeader
      title={tConditional(t, 'taxEstimates:label.tax_overview', {
        condition: projectedCondition,
        cases: {
          default: 'Tax Overview',
          projected: 'Projected Tax Overview',
        },
        contexts: {
          projected: 'projected',
        },
      })}
      description={t('taxEstimates:label.overview_foundation_description', 'High-level tax totals and payment timeline for the selected year')}
      isMobile={isMobile}
    />
  )
}

export const TaxOverview = () => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const { data: summary, isLoading: isSummaryLoading, isError: isSummaryError } = useTaxSummary({ year, fullYearProjection })
  const { data: banner, isLoading: isBannerLoading, isError: isBannerError } = useTaxEstimatesBanner({ year, fullYearProjection })
  const { isDesktop } = useSizeClass()

  const data = useMemo((): TaxOverviewData | undefined => {
    if (!summary || !banner) {
      return
    }

    return {
      summary,
      banner,
      nextQuarter: getNextQuarter(banner),
    }
  }, [summary, banner])

  const Header = useCallback(() => (
    <TaxOverviewHeader isMobile={!isDesktop} />
  ), [isDesktop])

  return (
    <ResponsiveDetailView name='TaxOverview' slots={{ Header }}>
      <ConditionalBlock
        isLoading={isSummaryLoading || isBannerLoading}
        isError={isSummaryError || isBannerError}
        data={data}
        Loading={<Loader />}
        Inactive={(
          <DataState
            spacing
            status={DataStateStatus.info}
            title={t('taxEstimates:empty.tax_overview', 'No tax overview data found')}
            description={t('taxEstimates:empty.no_tax_overview_to_display', 'There is no tax overview data to display for this year.')}
          />
        )}
        Error={(
          <DataState
            spacing
            status={DataStateStatus.failed}
            title={t('taxEstimates:error.load_tax_overview', 'We couldn\'t load your tax overview')}
            description={t('taxEstimates:error.while_loading_tax_overview', 'An error occurred while loading your tax overview. Please check your connection and try again.')}
          />
        )}
      >
        {({ data: overview }) => (
          <VStack gap='md'>
            {isDesktop
              ? (
                <HStack gap='md'>
                  <Card>
                    <VStack gap='xs'>
                      <Span size='sm' variant='subtle'>{t('taxEstimates:label.projected_taxes_owed', 'Projected Taxes Owed')}</Span>
                      <MoneySpan size='xl' weight='bold' amount={overview.summary.projectedTaxesOwed} />
                      <Span size='sm' variant='subtle'>
                        {t('taxEstimates:label.taxes_due_on', 'Taxes due on {{date}}', {
                          date: formatDate(overview.summary.taxesDueAt, DateFormat.DateShort),
                        })}
                      </Span>
                    </VStack>
                  </Card>
                  <Card>
                    <VStack gap='xs'>
                      <Span size='sm' variant='subtle'>{t('taxEstimates:label.next_payment', 'Next Payment')}</Span>
                      {overview.nextQuarter
                        ? (
                          <>
                            <Span size='md' weight='bold'>
                              {t('taxEstimates:label.quarter_due', 'Q{{quarter}} due {{date}}', {
                                quarter: overview.nextQuarter.quarter,
                                date: formatDate(overview.nextQuarter.dueDate, DateFormat.DateShort),
                              })}
                            </Span>
                            <MoneySpan size='xl' weight='bold' amount={overview.nextQuarter.balance} />
                            <Span size='sm' variant='subtle'>{t('taxEstimates:label.balance_due', 'Balance Due')}</Span>
                          </>
                        )
                        : (
                          <Span size='sm' variant='subtle'>{t('taxEstimates:label.no_upcoming_payments', 'No upcoming payments')}</Span>
                        )}
                    </VStack>
                  </Card>
                </HStack>
              )
              : (
                <VStack gap='md'>
                  <Card>
                    <VStack gap='xs'>
                      <Span size='sm' variant='subtle'>{t('taxEstimates:label.projected_taxes_owed', 'Projected Taxes Owed')}</Span>
                      <MoneySpan size='xl' weight='bold' amount={overview.summary.projectedTaxesOwed} />
                      <Span size='sm' variant='subtle'>
                        {t('taxEstimates:label.taxes_due_on', 'Taxes due on {{date}}', {
                          date: formatDate(overview.summary.taxesDueAt, DateFormat.DateShort),
                        })}
                      </Span>
                    </VStack>
                  </Card>
                  <Card>
                    <VStack gap='xs'>
                      <Span size='sm' variant='subtle'>{t('taxEstimates:label.next_payment', 'Next Payment')}</Span>
                      {overview.nextQuarter
                        ? (
                          <>
                            <Span size='md' weight='bold'>
                              {t('taxEstimates:label.quarter_due', 'Q{{quarter}} due {{date}}', {
                                quarter: overview.nextQuarter.quarter,
                                date: formatDate(overview.nextQuarter.dueDate, DateFormat.DateShort),
                              })}
                            </Span>
                            <MoneySpan size='xl' weight='bold' amount={overview.nextQuarter.balance} />
                            <Span size='sm' variant='subtle'>{t('taxEstimates:label.balance_due', 'Balance Due')}</Span>
                          </>
                        )
                        : (
                          <Span size='sm' variant='subtle'>{t('taxEstimates:label.no_upcoming_payments', 'No upcoming payments')}</Span>
                        )}
                    </VStack>
                  </Card>
                </VStack>
              )}
            <Card>
              <VStack gap='sm'>
                <Span size='md' weight='bold'>{t('taxEstimates:label.quarterly_deadlines', 'Quarterly Deadlines')}</Span>
                {overview.banner.quarters.map(quarter => (
                  <HStack key={quarter.quarter} justify='space-between' align='center'>
                    <VStack gap='4xs'>
                      <Span size='sm' weight='bold'>
                        {t('taxEstimates:label.quarter_short', 'Q{{quarter}}', { quarter: quarter.quarter })}
                      </Span>
                      <Span size='sm' variant='subtle'>{formatDate(quarter.dueDate, DateFormat.DateShort)}</Span>
                    </VStack>
                    <VStack align='end' gap='4xs'>
                      <MoneySpan size='md' weight='bold' amount={quarter.balance} />
                      <Span size='xs' variant='subtle'>{t('taxEstimates:label.balance', 'Balance')}</Span>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            </Card>
          </VStack>
        )}
      </ConditionalBlock>
    </ResponsiveDetailView>
  )
}
