import { type TaxOverviewData } from '@schemas/taxEstimates/overview'
import { VStack } from '@ui/Stack/Stack'
import { TaxableIncomeCard } from '@components/TaxOverview/TaxableIncomeCard'

import './taxOverview.scss'

type TaxOverviewProps = {
  data: TaxOverviewData
  title: string
  description: string
}

export const TaxOverview = ({
  data,
  description,
  title,
}: TaxOverviewProps) => {
  return (
    <VStack className='Layer__TaxOverview' gap='md'>
      <TaxableIncomeCard
        description={description}
        incomeTotal={data.incomeTotal}
        deductionsTotal={data.deductionsTotal}
        title={title}
        showHeader={false}
      />
    </VStack>
  )
}
