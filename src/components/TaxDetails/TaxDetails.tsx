import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { tConditional } from '@utils/i18n/conditional'
import { useTaxDetails } from '@hooks/api/businesses/[business-id]/tax-estimates/details/useTaxDetails'
import { useTaxSummary } from '@hooks/api/businesses/[business-id]/tax-estimates/summary/useTaxSummary'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { Card } from '@components/Card/Card'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { ExpandableCard } from '@components/ExpandableCard/ExpandableCard'
import { Loader } from '@components/Loader/Loader'
import { ResponsiveDetailView } from '@components/ResponsiveDetailView/ResponsiveDetailView'
import { AdjustedGrossIncomeTable } from '@components/TaxDetails/AdjustedGrossIncomeTable/AdjustedGrossIncomeTable'
import { FederalTaxTable } from '@components/TaxDetails/FederalTaxTable/FederalTaxTable'
import { StateTaxTable } from '@components/TaxDetails/StateTaxTable/StateTaxTable'
import { TaxDetailsExpandableCardHeading } from '@components/TaxDetails/TaxDetailsExpandableCardHeading'
import { TaxSummaryCard } from '@components/TaxDetails/TaxSummaryCard/TaxSummaryCard'
import { TaxEstimatesHeader, TaxEstimatesHeaderType } from '@components/TaxEstimates/TaxEstimatesHeader'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

import './taxDetails.scss'

type ExpandedState = {
  taxableIncome: boolean
  federalTaxes: boolean
  stateTaxes: boolean
}

const TaxDetailsHeader = () => <TaxEstimatesHeader type={TaxEstimatesHeaderType.Estimates} />

const MobileExpandableCardsWrapper = ({ children }: { children: ReactNode }) => (
  <Card className='Layer__TaxDetails__ExpandableCardsWrapper'>{children}</Card>
)

export const TaxDetails = () => {
  const { t } = useTranslation()
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const projectedCondition: 'default' | 'projected' = fullYearProjection ? 'projected' : 'default'
  const { data, isLoading, isError } = useTaxDetails({ year, fullYearProjection })
  const { data: summaryData, isLoading: isSummaryLoading } = useTaxSummary({ year, fullYearProjection })
  const { isDesktop } = useSizeClass()

  const [expanded, setExpanded] = useState<ExpandedState>({
    taxableIncome: true,
    federalTaxes: true,
    stateTaxes: true,
  })

  const toggleExpanded = useCallback((key: keyof ExpandedState) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const ExpandableCardsWrapper = isDesktop ? VStack : MobileExpandableCardsWrapper

  return (
    <ResponsiveDetailView
      name='TaxDetails'
      slots={{ Header: TaxDetailsHeader }}
      mobileProps={{ className: 'Layer__TaxDetails--mobile' }}
    >
      <ConditionalBlock
        isLoading={isSummaryLoading}
        isError={isError}
        data={summaryData}
        Loading={<Loader />}
        Error={(
          <DataState
            status={DataStateStatus.failed}
            title={t('taxEstimates:error.load_tax_estimates_summary', 'We couldn\'t load your tax summary')}
            description={t('taxEstimates:error.while_loading_tax_summary', 'An error occurred while loading your tax summary. Please check your connection and try again.')}
            spacing
          />
        )}
      >
        {({ data: summary }) => <TaxSummaryCard data={summary} />}
      </ConditionalBlock>
      <ConditionalBlock
        isLoading={isLoading}
        isError={isError}
        data={data}
        Loading={<Loader />}
        Error={(
          <DataState
            status={DataStateStatus.failed}
            title={t('taxEstimates:error.load_tax_estimates', 'We couldn\'t load your tax estimates')}
            description={t('taxEstimates:error.while_loading_tax_estimates', 'An error occurred while loading your tax estimates. Please check your connection and try again.')}
            spacing
          />
        )}
      >
        {({ data: details }) => {
          const usFederal = details.taxes.usFederal
          const usState = details.taxes.usState

          return (
            <ExpandableCardsWrapper className='Layer__TaxDetails__ExpandableCardsWrapper'>
              <ExpandableCard
                isExpanded={expanded.taxableIncome}
                onToggleExpanded={() => toggleExpanded('taxableIncome')}
                expandButtonPosition='left'
                slots={{
                  Heading: (
                    <TaxDetailsExpandableCardHeading
                      title={tConditional(t, 'taxEstimates:label.taxable_business_income', {
                        condition: projectedCondition,
                        cases: {
                          default: 'Taxable Business Income',
                          projected: 'Projected Taxable Business Income',
                        },
                        contexts: {
                          projected: 'projected',
                        },
                      })}
                      amount={details.adjustedGrossIncome.totalAdjustedGrossIncome}
                    />
                  ),
                }}
              >
                <AdjustedGrossIncomeTable data={details.adjustedGrossIncome} />
              </ExpandableCard>
              {usFederal && (
                <ExpandableCard
                  isExpanded={expanded.federalTaxes}
                  onToggleExpanded={() => toggleExpanded('federalTaxes')}
                  expandButtonPosition='left'
                  slots={{
                    Heading: (
                      <TaxDetailsExpandableCardHeading
                        title={tConditional(t, 'taxEstimates:label.federal_taxes', {
                          condition: projectedCondition,
                          cases: {
                            default: 'Federal Taxes',
                            projected: 'Projected Federal Taxes',
                          },
                          contexts: {
                            projected: 'projected',
                          },
                        })}
                        amount={usFederal.totalFederalTax.totalFederalTaxOwed}
                      />
                    ),
                  }}
                >
                  <FederalTaxTable data={usFederal} adjustedGrossIncome={details.adjustedGrossIncome.totalAdjustedGrossIncome} />
                </ExpandableCard>
              )}
              {usState && (
                <ExpandableCard
                  isExpanded={expanded.stateTaxes}
                  onToggleExpanded={() => toggleExpanded('stateTaxes')}
                  expandButtonPosition='left'
                  slots={{
                    Heading: (
                      <TaxDetailsExpandableCardHeading
                        title={tConditional(t, 'taxEstimates:label.taxes_by_state_name', {
                          condition: projectedCondition,
                          cases: {
                            default: 'State Taxes ({{stateName}})',
                            projected: 'Projected State Taxes ({{stateName}})',
                          },
                          contexts: {
                            projected: 'projected',
                          },
                          stateName: usState.stateName,
                        })}
                        amount={usState.totalStateTax.totalStateTaxOwed}
                      />
                    ),
                  }}
                >
                  <StateTaxTable data={usState} />
                </ExpandableCard>
              )}
            </ExpandableCardsWrapper>
          )
        }}
      </ConditionalBlock>
    </ResponsiveDetailView>
  )
}
