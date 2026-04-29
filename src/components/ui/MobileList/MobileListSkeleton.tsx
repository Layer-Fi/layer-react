import type { MobileListVariant } from '@ui/MobileList/MobileList'
import { HStack, VStack } from '@ui/Stack/Stack'
import { SkeletonLoader } from '@components/SkeletonLoader/SkeletonLoader'

import './mobileListSkeleton.scss'

interface MobileListSkeletonProps {
  rows?: number
  variant?: MobileListVariant
}

export const MobileListSkeleton = ({ rows = 5, variant = 'default' }: MobileListSkeletonProps) => {
  return (
    <VStack className='Layer__MobileListSkeleton' data-variant={variant} gap='sm'>
      {Array.from({ length: rows }).map((_, index) => (
        <MobileListSkeletonItem key={index} variant={variant} />
      ))}
    </VStack>
  )
}

const MobileListSkeletonItem = ({ variant }: { variant: MobileListVariant }) => {
  if (variant === 'compact') {
    return (
      <HStack className='Layer__MobileListSkeleton__Item' fluid align='center' justify='space-between' gap='sm'>
        <SkeletonLoader width='60%' height='16px' />
        <SkeletonLoader width='16px' height='16px' />
      </HStack>
    )
  }

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
