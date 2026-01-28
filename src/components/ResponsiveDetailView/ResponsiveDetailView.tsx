import classNames from 'classnames'
import type { PropsWithChildren } from 'react'

import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { VStack } from '@ui/Stack/Stack'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'

import './responsiveDetailView.scss'

type ResponsiveDetailViewProps = PropsWithChildren<{
  name: string
  slots: {
    Header: React.FC
  }
  mobileProps?: {
    className?: string
  }
}>

export const ResponsiveDetailView = ({
  name,
  slots,
  children,
  mobileProps,
}: ResponsiveDetailViewProps) => {
  const { isDesktop } = useSizeClass()

  if (isDesktop) {
    return (
      <BaseDetailView name={name} slots={slots}>
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
