import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'

import { useTaxDetails } from '@hooks/taxEstimates/useTaxDetails'
import { useTaxSummary } from '@hooks/taxEstimates/useTaxSummary'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { Card } from '@components/Card/Card'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { ExpandableCard } from '@components/ExpandableCard/ExpandableCard'
import { Loader } from '@components/Loader/Loader'
import { ResponsiveDetailHeader } from '@components/ResponsiveDetailView/ResponsiveDetailHeader'
import { ResponsiveDetailView } from '@components/ResponsiveDetailView/ResponsiveDetailView'
import { AdjustedGrossIncomeTable } from '@components/TaxDetails/AdjustedGrossIncomeTable/AdjustedGrossIncomeTable'
import { FederalTaxTable } from '@components/TaxDetails/FederalTaxTable/FederalTaxTable'
import { StateTaxTable } from '@components/TaxDetails/StateTaxTable/StateTaxTable'
import { TaxDetailsExpandableCardHeading } from '@components/TaxDetails/TaxDetailsExpandableCardHeading'
import { TaxSummaryCard } from '@components/TaxDetails/TaxSummaryCard/TaxSummaryCard'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

import './taxDetails.scss'

type ExpandedState = {
  taxableIncome: boolean
  federalTaxes: boolean
  stateTaxes: boolean
}

const TaxDetailsHeader = () => (
  <ResponsiveDetailHeader
    title='Estimated Business Income Taxes'
    description='Calculated based on your categorized transactions and tracked mileage'
  />
)

const MobileExpandableCardsWrapper = ({ children }: { children: ReactNode }) => (
  <Card className='Layer__TaxDetails__ExpandableCardsWrapper'>{children}</Card>
)

export const TaxDetails = () => {
  const { year } = useTaxEstimatesYear()
  const { data, isLoading, isError } = useTaxDetails({ year })
  const { data: summaryData, isLoading: isSummaryLoading } = useTaxSummary({ year })
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
        Inactive={null}
        Error={(
          <DataState
            status={DataStateStatus.failed}
            title="We couldn't load your tax summary"
            description='An error occurred while loading your tax summary. Please check your connection and try again.'
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
            title="We couldn't load your tax estimates"
            description='An error occurred while loading your tax estimates. Please check your connection and try again.'
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
                      title='Taxable Business Income'
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
                        title='Estimated Federal Taxes'
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
                        title={`Estimated State Taxes (${usState.stateName})`}
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
