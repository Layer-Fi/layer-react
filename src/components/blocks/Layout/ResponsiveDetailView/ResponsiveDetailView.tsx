import classNames from 'classnames'
import type { PropsWithChildren } from 'react'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { VStack } from '@ui/Stack/Stack'
import { BaseDetailView } from '@blocks/Layout/BaseDetailView/BaseDetailView'

import './responsiveDetailView.scss'

type ResponsiveDetailViewProps = PropsWithChildren<{
  className?: string
  slots: {
    Header: React.FC
  }
  mobileProps?: {
    className?: string
  }
}>

export const ResponsiveDetailView = ({
  className,
  slots,
  children,
  mobileProps,
}: ResponsiveDetailViewProps) => {
  const { isDesktop } = useSizeClass()

  if (isDesktop) {
    return (
      <BaseDetailView className={className} slots={slots}>
        {children}
      </BaseDetailView>
    )
  }

  return (
    <VStack className={classNames('Layer__ResponsiveDetailView', mobileProps?.className)} gap='md'>
      <slots.Header />
      {children}
    </VStack>
  )
}
