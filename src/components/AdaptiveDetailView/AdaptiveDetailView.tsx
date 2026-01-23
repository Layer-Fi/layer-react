import type { PropsWithChildren } from 'react'

import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { VStack } from '@ui/Stack/Stack'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'

type AdaptiveDetailViewProps = PropsWithChildren<{
  name: string
  slots: {
    Header: React.FC
  }
  mobileProps?: {
    className?: string
  }
}>

export const AdaptiveDetailView = ({
  name,
  slots,
  children,
  mobileProps,
}: AdaptiveDetailViewProps) => {
  const { isDesktop } = useSizeClass()

  if (isDesktop) {
    return (
      <BaseDetailView name={name} slots={slots}>
        {children}
      </BaseDetailView>
    )
  }

  return (
    <VStack className={mobileProps?.className} gap='md'>
      <slots.Header />
      {children}
    </VStack>
  )
}
