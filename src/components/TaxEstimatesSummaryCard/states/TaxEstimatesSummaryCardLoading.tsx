import { VStack } from '@ui/Stack/Stack'
import { CircleSkeletonLoader, SkeletonLoader } from '@components/SkeletonLoader/SkeletonLoader'
import { TaxEstimatesSummaryCardMode } from '@components/TaxEstimatesSummaryCard/constants'

export const TaxEstimatesSummaryCardLoading = ({ mode }: { mode: TaxEstimatesSummaryCardMode }) => {
  if (mode === TaxEstimatesSummaryCardMode.HorizontalBarChart) {
    return (
      <VStack gap='md' className='Layer__TaxEstimatesSummaryCard__Content' pb='md' pi='lg'>
        <SkeletonLoader height='24px' width='40%' />
        <SkeletonLoader height='24px' width='100%' />
        <SkeletonLoader height='16px' width='100%' />
      </VStack>
    )
  }
  return (
    <VStack gap='md' className='Layer__TaxEstimatesSummaryCard__Content' pb='md' pi='lg' align='center'>
      <CircleSkeletonLoader height='128px' width='128px' />
      <SkeletonLoader height='24px' width='80%' />
      <SkeletonLoader height='24px' width='80%' />
      <SkeletonLoader height='24px' width='80%' />
    </VStack>
  )
}
