import { HStack, VStack } from '@ui/Stack/Stack'
import { SkeletonLoader } from '@components/SkeletonLoader/SkeletonLoader'

import './mobileListSkeleton.scss'

interface MobileListSkeletonProps {
  rows?: number
}

export const MobileListSkeleton = ({ rows = 5 }: MobileListSkeletonProps) => {
  return (
    <VStack className='Layer__MobileListSkeleton' gap='sm'>
      {Array.from({ length: rows }).map((_, index) => (
        <MobileListSkeletonItem key={index} />
      ))}
    </VStack>
  )
}

const MobileListSkeletonItem = () => {
  return (
    <HStack className='Layer__MobileListSkeleton__Item' gap='md' align='center'>
      <VStack gap='xs' fluid>
        <SkeletonLoader width='60%' height='16px' />
        <SkeletonLoader width='40%' height='12px' />
      </VStack>
      <VStack gap='xs' align='end'>
        <SkeletonLoader width='64px' height='16px' />
        <SkeletonLoader width='80px' height='12px' />
      </VStack>
    </HStack>
  )
}
