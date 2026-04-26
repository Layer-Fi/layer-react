import { HStack, VStack } from '@ui/Stack/Stack'
import { SkeletonLoader } from '@components/SkeletonLoader/SkeletonLoader'

import './treeNavigationSkeleton.scss'

type TreeNavigationSkeletonProps = {
  groups?: number
  leavesPerGroup?: number
}

export const TreeNavigationSkeleton = ({
  groups = 2,
  leavesPerGroup = 3,
}: TreeNavigationSkeletonProps) => (
  <VStack className='Layer__TreeNavigationSkeleton' aria-hidden='true'>
    {Array.from({ length: groups }).map((_, groupIndex) => (
      <VStack key={groupIndex}>
        <HStack className='Layer__TreeNavigationSkeleton__Group' align='center' gap='sm'>
          <SkeletonLoader width='16px' height='16px' />
          <SkeletonLoader width='60%' height='12px' />
        </HStack>
        {Array.from({ length: leavesPerGroup }).map((_, leafIndex) => (
          <HStack key={leafIndex} className='Layer__TreeNavigationSkeleton__Leaf' align='center'>
            <SkeletonLoader width='70%' height='12px' />
          </HStack>
        ))}
      </VStack>
    ))}
  </VStack>
)
