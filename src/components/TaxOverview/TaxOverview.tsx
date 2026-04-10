import { type TaxOverviewData } from '@schemas/taxEstimates/overview'
import { VStack } from '@ui/Stack/Stack'
import { TaxableIncomeCard } from '@components/TaxOverview/TaxableIncomeCard'

import './taxOverview.scss'

type TaxOverviewProps = {
  data: TaxOverviewData
}

export const TaxOverview = ({
  data,
}: TaxOverviewProps) => {
  return (
    <VStack className='Layer__TaxOverview' gap='md'>
      <TaxableIncomeCard
        incomeTotal={data.incomeTotal}
        deductionsTotal={data.deductionsTotal}
        showHeader={false}
      />
    </VStack>
  )
}
