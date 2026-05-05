import { useTranslation } from 'react-i18next'

import { useTaxableIncome } from '@hooks/api/businesses/[business-id]/tax-estimates/taxable-income/useTaxableIncome'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { HStack, Stack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Loader } from '@components/Loader/Loader'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

import './taxEstimatesTaxableIncomeCard.scss'

const HEADING_LEVEL = 3

const LoadingState = () => <Loader />
const ErrorState = () => {
  const { t } = useTranslation()
  return (
    <DataState
      status={DataStateStatus.failed}
      title={t('taxEstimates:error.load_taxable_income', 'We couldn\'t load your taxable income')}
      description={t('taxEstimates:error.while_loading_taxable_income', 'An error occurred while loading your taxable income. Please check your connection and try again.')}
    />
  )
}

type ScoreCardProps = {
  title: string
  subtitle: string
  amount: number
}

function ScoreCard({ title, subtitle, amount }: ScoreCardProps) {
  return (
    <Card className='Layer__card--reset Layer__TaxOverview__ScoreCard'>
      <HStack justify='space-between' align='start' gap='md' pb='md' pi='md'>
        <VStack className='Layer__TaxOverview__ScoreCard__Content' gap='3xs' fluid>
          <Heading level={HEADING_LEVEL} size='sm'>{title}</Heading>
          <Span size='sm' variant='subtle'>{subtitle}</Span>
        </VStack>
        <VStack className='Layer__TaxOverview__ScoreCard__AmountColumn' align='end' gap='3xs'>
          <MoneySpan size='lg' weight='bold' amount={amount} />
        </VStack>
      </HStack>
    </Card>
  )
}

export const TaxEstimatesTaxableIncomeCard = () => {
  const { t } = useTranslation()
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const { isMobile } = useSizeClass()

  const { data: taxableIncomeData, isLoading, isError } = useTaxableIncome({
    year,
    fullYearProjection,
    enabled: true,
  })

  return (
    <ConditionalBlock
      data={taxableIncomeData}
      isLoading={isLoading}
      isError={isError}
      Loading={<LoadingState />}
      Error={<ErrorState />}
    >
      {({ data }) => {
        const subtitle = t('taxEstimates:label.estimated_for_year', 'Estimated for {{year}}', { year })
        return (
          <Stack
            className='Layer__TaxEstimatesTaxableIncomeCard'
            direction={isMobile ? 'column' : 'row'}
            gap='md'
            fluid
          >
            <ScoreCard
              title={t('taxEstimates:label.federal_taxable_income', 'Federal Taxable Income')}
              subtitle={subtitle}
              amount={data.federalTaxableIncome}
            />
            <ScoreCard
              title={t('taxEstimates:label.state_taxable_income', 'State Taxable Income')}
              subtitle={subtitle}
              amount={data.stateTaxableIncome}
            />
          </Stack>
        )
      }}
    </ConditionalBlock>
  )
}
