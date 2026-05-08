import { HStack } from '@ui/Stack/Stack'

import './solopreneurOverviewDetailedCharts.scss'

export const SolopreneurOverviewDetailedCharts = () => {
  return (
    <HStack
      gap='md'
      align='start'
      className='Layer__SolopreneurLayout__DetailedCharts'
    >
      <div className='Layer__SolopreneurLayout__DetailedCharts__col' />
      <div className='Layer__SolopreneurLayout__DetailedCharts__col' />
    </HStack>
  )
}
