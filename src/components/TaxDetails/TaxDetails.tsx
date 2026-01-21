import { useTaxDetails } from '@hooks/taxEstimates/useTaxDetails'
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
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

import './taxDetails.scss'

type CardHeadingProps = {
  title: string
  amount: number
}

const CardHeading = ({ title, amount }: CardHeadingProps) => (
  <HStack className='Layer__TaxDetails__CardHeading' pie='xs'>
    <Heading size='md'>{title}</Heading>
    <Spacer />
    <MoneySpan size='xl' weight='bold' amount={amount} />
  </HStack>
)

const TaxDetailsHeader = () => (
  <VStack gap='3xs'>
    <Heading size='md'>Estimated Business Income Taxes</Heading>
    <Span size='md' variant='subtle'>
      Calculated based on your categorized transactions and tracked mileage
    </Span>
  </VStack>
)

export const TaxDetails = () => {
  const { year } = useTaxEstimatesYear()
  const { data, isLoading, isError } = useTaxDetails({ year })

  return (
    <BaseDetailView name='TaxDetails' slots={{ Header: TaxDetailsHeader }}>
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
            </VStack>
          )
        }}
      </ConditionalBlock>
    </BaseDetailView>
  )
}
