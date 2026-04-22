import { useWindowSize } from '@hooks/utils/size/useWindowSize'
import { HStack, VStack } from '@ui/Stack/Stack'
import { TaxEstimatesHeader, TaxEstimatesHeaderType } from '@components/TaxEstimates/TaxEstimatesHeader'
import { TaxEstimatesSummaryCard } from '@components/TaxEstimatesSummaryCard/TaxEstimatesSummaryCard'
import { TaxDeadlinesCard } from '@components/TaxOverview/TaxDeadlinesCard'

import '@components/TaxOverview/taxOverview.scss'

import { TaxableIncomeCard } from './TaxableIncomeCard'

export const TaxOverview = () => {
  const [viewportWidth] = useWindowSize()
  const isMobile = viewportWidth < 1200

  if (!isMobile) {
    return (
      <VStack className='Layer__TaxOverview' gap='md'>
        <HStack className='Layer__TaxOverview__DesktopLayout' gap='md' align='start'>
          <VStack className='Layer__TaxOverview__PrimaryColumn' gap='md'>
            <TaxableIncomeCard />
            <TaxEstimatesSummaryCard />
          </VStack>
          <VStack className='Layer__TaxOverview__SecondaryColumn'>
            <TaxDeadlinesCard />
          </VStack>
        </HStack>
      </VStack>
    )
  }

  return (
    <VStack className='Layer__TaxOverview' gap='md'>
      <TaxEstimatesHeader type={TaxEstimatesHeaderType.Overview} />
      <TaxableIncomeCard />
      <TaxEstimatesSummaryCard />
      <TaxDeadlinesCard />
    </VStack>
  )
}
