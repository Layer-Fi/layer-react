import type { PropsWithChildren } from 'react'

import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import type { Spacing } from '@ui/sharedUITypes'
import { VStack } from '@ui/Stack/Stack'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'

type AdaptiveDetailViewProps = PropsWithChildren<{
  name: string
  Header: React.FC
  mobileClassName?: string
  mobileGap?: Spacing
}>

export const AdaptiveDetailView = ({
  name,
  Header,
  children,
  mobileClassName,
  mobileGap = 'md',
}: AdaptiveDetailViewProps) => {
  const { isDesktop } = useSizeClass()

  if (isDesktop) {
    return (
      <BaseDetailView name={name} slots={{ Header }}>
        {children}
      </BaseDetailView>
    )
  }

  return (
    <VStack className={mobileClassName} gap={mobileGap}>
      <Header />
      {children}
    </VStack>
  )
}
