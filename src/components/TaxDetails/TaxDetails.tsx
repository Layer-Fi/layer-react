import { useTaxDetails } from '@hooks/taxEstimates/useTaxDetails'
import { useTaxSummary } from '@hooks/taxEstimates/useTaxSummary'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { ExpandableCard } from '@components/ExpandableCard/ExpandableCard'
import { Loader } from '@components/Loader/Loader'
import { AdjustedGrossIncomeTable } from '@components/TaxDetails/AdjustedGrossIncomeTable/AdjustedGrossIncomeTable'
import { FederalTaxTable } from '@components/TaxDetails/FederalTaxTable/FederalTaxTable'
import { TaxSummaryCard } from '@components/TaxDetails/TaxSummaryCard/TaxSummaryCard'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

import './taxDetails.scss'

import { StateTaxTable } from './StateTaxTable/StateTaxTable'

type CardHeadingProps = {
  title: string
  amount: number
}

const CardHeading = ({ title, amount }: CardHeadingProps) => {
  const { isMobile } = useSizeClass()
  return (
    <HStack className='Layer__TaxDetails__CardHeading' pie='xs' gap='xs'>
      <Heading size={isMobile ? 'sm' : 'md'}>{title}</Heading>
      <Spacer />
      <MoneySpan size='xl' weight='bold' amount={amount} />
    </HStack>
  )
}

const TaxDetailsHeader = () => {
  const { isMobile } = useSizeClass()
  return (
    <VStack gap='3xs'>
      <Heading size={isMobile ? 'sm' : 'md'}>Estimated Business Income Taxes</Heading>
      <Span size='md' variant='subtle'>
        Calculated based on your categorized transactions and tracked mileage
      </Span>
    </VStack>
  )
}

export const TaxDetails = () => {
  const { year } = useTaxEstimatesYear()
  const { data, isLoading, isError } = useTaxDetails({ year })
  const { data: summaryData, isLoading: isSummaryLoading } = useTaxSummary({ year })

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
        {({ data }) => {
          const usFederal = data.taxes.usFederal
          const usState = data.taxes.usState

          return (
            <VStack>
              <ExpandableCard
                slots={{
                  Heading: (
                    <CardHeading
                      title='Taxable Business Income'
                      amount={data.adjustedGrossIncome.totalAdjustedGrossIncome}
                    />
                  ),
                }}
              >
                <AdjustedGrossIncomeTable data={data.adjustedGrossIncome} />
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
                  <FederalTaxTable data={usFederal} adjustedGrossIncome={data.adjustedGrossIncome.totalAdjustedGrossIncome} />
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
