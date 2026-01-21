import { useCallback } from 'react'

import { useTaxDetails } from '@hooks/taxEstimates/useTaxDetails'
import { useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
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
    <Heading size='sm'>{title}</Heading>
    <Spacer />
    <MoneySpan size='lg' weight='bold' amount={amount} />
  </HStack>
)

export const TaxDetails = () => {
  const { startDate } = useGlobalDateRange({ dateSelectionMode: 'year' })
  const selectedYear = startDate.getFullYear()
  const { data, isLoading, isError } = useTaxDetails({ year: selectedYear })

  const TaxDetailsHeader = useCallback(() => (
    <VStack gap='3xs'>
      <Heading size='md'>Adjusted Gross Income</Heading>
      <Span size='md' variant='subtle'>
        Income and deductions for the
        {' '}
        {selectedYear}
        {' '}
        tax year
      </Span>
    </VStack>
  ), [selectedYear])

  return (
    <BaseDetailView name='TaxDetails' slots={{ Header: TaxDetailsHeader }}>
      <ConditionalBlock
        isLoading={isLoading}
        isError={isError}
        data={data}
        Loading={<Loader />}
        Inactive={null}
        Error={<DataState status={DataStateStatus.failed} />}
      >
        {({ data }) => (
          <VStack gap='lg' pbe='lg'>
            <ExpandableCard
              slots={{
                Heading: () => (
                  <CardHeading
                    title='Adjusted Gross Income'
                    amount={data.adjustedGrossIncome.totalAdjustedGrossIncome}
                  />
                ),
              }}
            >
              <AdjustedGrossIncomeTable data={data.adjustedGrossIncome} />
            </ExpandableCard>
            {data.taxes.usFederal && (() => {
              const usFederal = data.taxes.usFederal
              return (
                <ExpandableCard
                  slots={{
                    Heading: () => (
                      <CardHeading
                        title='Federal Tax'
                        amount={usFederal.totalFederalTax.totalFederalTaxOwed}
                      />
                    ),
                  }}
                >
                  <FederalTaxTable
                    data={usFederal}
                    adjustedGrossIncome={data.adjustedGrossIncome.totalAdjustedGrossIncome}
                  />
                </ExpandableCard>
              )
            })()}
          </VStack>
        )}
      </ConditionalBlock>
    </BaseDetailView>
  )
}
