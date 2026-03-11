import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

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
import { TaxEstimatesHeader } from '@components/TaxEstimates/TaxEstimatesHeader'
import { maybeAddProjectedToLabel } from '@components/TaxEstimates/utils'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

import './taxDetails.scss'

type ExpandedState = {
  taxableIncome: boolean
  federalTaxes: boolean
  stateTaxes: boolean
}

const TaxDetailsHeader = ({ isMobile }: { isMobile: boolean }) => {
  const { t } = useTranslation()
  const { fullYearProjection } = useFullYearProjection()
  return (
    <TaxEstimatesHeader
      title={maybeAddProjectedToLabel(t, {
        key: 'businessIncomeTaxes',
        isProjected: fullYearProjection,
        defaultCase: 'Business Income Taxes',
        projectedCase: 'Projected Business Income Taxes',
      })}
      description={t('calculatedBasedOnYourCategorizedTransactionsAndTrackedMileage', 'Calculated based on your categorized transactions and tracked mileage')}
      isMobile={isMobile}
    />
  )
}

const MobileExpandableCardsWrapper = ({ children }: { children: ReactNode }) => (
  <Card className='Layer__TaxDetails__ExpandableCardsWrapper'>{children}</Card>
)

export const TaxDetails = () => {
  const { t } = useTranslation()
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
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

  const Header = useCallback(() => (
    <TaxDetailsHeader isMobile={!isDesktop} />
  ), [isDesktop])

  return (
    <ResponsiveDetailView
      name='TaxDetails'
      slots={{ Header }}
      mobileProps={{ className: 'Layer__TaxDetails--mobile' }}
    >
      <ConditionalBlock
        isLoading={isSummaryLoading}
        isError={isError}
        data={summaryData}
        Loading={<Loader />}
        Inactive={null}
        Error={(
          <DataState
            status={DataStateStatus.failed}
            title={t('weCouldntLoadYourTaxSummary', 'We couldn\'t load your tax summary')}
            description={t('anErrorOccurredWhileLoadingYourTaxSummaryPleaseCheckYourConnectionAndTryAgain', 'An error occurred while loading your tax summary. Please check your connection and try again.')}
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
        Inactive={null}
        Error={(
          <DataState
            status={DataStateStatus.failed}
            title={t('weCouldntLoadYourTaxEstimates', 'We couldn\'t load your tax estimates')}
            description={t('anErrorOccurredWhileLoadingYourTaxEstimatesPleaseCheckYourConnectionAndTryAgain', 'An error occurred while loading your tax estimates. Please check your connection and try again.')}
            spacing
          />
        )}
      >
        {({ data: details }) => {
          const usFederal = details.taxes.usFederal
          const usState = details.taxes.usState

          return (
            <ExpandableCardsWrapper>
              <ExpandableCard
                isExpanded={expanded.taxableIncome}
                onToggleExpanded={() => toggleExpanded('taxableIncome')}
                slots={{
                  Heading: (
                    <TaxDetailsExpandableCardHeading
                      title={maybeAddProjectedToLabel(t, {
                        key: 'taxableBusinessIncome',
                        isProjected: fullYearProjection,
                        defaultCase: 'Taxable Business Income',
                        projectedCase: 'Projected Taxable Business Income',
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
                  slots={{
                    Heading: (
                      <TaxDetailsExpandableCardHeading
                        title={maybeAddProjectedToLabel(t, {
                          key: 'federalTaxes',
                          isProjected: fullYearProjection,
                          defaultCase: 'Federal Taxes',
                          projectedCase: 'Projected Federal Taxes',
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
                  slots={{
                    Heading: (
                      <TaxDetailsExpandableCardHeading
                        title={maybeAddProjectedToLabel(t, {
                          key: 'stateTaxesStateName',
                          isProjected: fullYearProjection,
                          defaultCase: 'State Taxes ({{stateName}})',
                          projectedCase: 'Projected State Taxes ({{stateName}})',
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
