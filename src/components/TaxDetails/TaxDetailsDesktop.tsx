import type { TaxDetails as TaxDetailsData } from '@schemas/taxEstimates/details'
import type { TaxSummary } from '@schemas/taxEstimates/summary'
import { VStack } from '@ui/Stack/Stack'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { ExpandableCard } from '@components/ExpandableCard/ExpandableCard'
import { Loader } from '@components/Loader/Loader'
import { AdjustedGrossIncomeTable } from '@components/TaxDetails/AdjustedGrossIncomeTable/AdjustedGrossIncomeTable'
import { FederalTaxTable } from '@components/TaxDetails/FederalTaxTable/FederalTaxTable'
import { StateTaxTable } from '@components/TaxDetails/StateTaxTable/StateTaxTable'
import { TaxSummaryCard } from '@components/TaxDetails/TaxSummaryCard/TaxSummaryCard'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

import { CardHeading } from './CardHeading'
import { TaxDetailsHeader } from './TaxDetailsHeader'

export type TaxDetailsContentProps = {
  summaryData: TaxSummary | undefined
  isSummaryLoading: boolean
  data: TaxDetailsData | undefined
  isLoading: boolean
  isError: boolean
}

export const TaxDetailsDesktop = ({
  summaryData,
  isSummaryLoading,
  data,
  isLoading,
  isError,
}: TaxDetailsContentProps) => {
  return (
    <BaseDetailView name='TaxDetails' slots={{ Header: TaxDetailsHeader }}>
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
            <VStack>
              <ExpandableCard
                slots={{
                  Heading: (
                    <CardHeading
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
                  slots={{
                    Heading: (
                      <CardHeading
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
                  slots={{
                    Heading: (
                      <CardHeading
                        title={`Estimated State Taxes (${usState.stateName})`}
                        amount={usState.totalStateTax.totalStateTaxOwed}
                      />
                    ),
                  }}
                >
                  <StateTaxTable data={usState} />
                </ExpandableCard>
              )}
            </VStack>
          )
        }}
      </ConditionalBlock>
    </BaseDetailView>
  )
}
