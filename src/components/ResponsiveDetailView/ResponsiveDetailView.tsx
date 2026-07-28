import { useCallback } from 'react'
import classNames from 'classnames'
import type { PropsWithChildren } from 'react'

import { ResponsiveComponent } from '@ui/ResponsiveComponent/ResponsiveComponent'
import { VStack } from '@ui/Stack/Stack'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'

type ResponsiveDetailViewProps = PropsWithChildren<{
  name: string
  className?: string
  minDesktopWidth: number
  slots: {
    Header: React.FC
  }
  mobileProps?: {
    className?: string
  }
}>

export const ResponsiveDetailView = ({
  name,
  className,
  minDesktopWidth,
  slots,
  children,
  mobileProps,
}: ResponsiveDetailViewProps) => {
  const resolveVariant = useCallback(
    ({ width }: { width: number }) => width >= minDesktopWidth ? 'Desktop' : 'Mobile' as const,
    [minDesktopWidth],
  )

  return (
    <ResponsiveComponent
      className={className}
      resolveVariant={resolveVariant}
      slots={{
        Desktop: (
          <BaseDetailView name={name} slots={slots}>
            {children}
          </BaseDetailView>
        ),
        Mobile: (
          <VStack
            className={classNames('Layer__ResponsiveDetailView', mobileProps?.className)}
            gap='md'
          >
            <slots.Header />
            {children}
          </VStack>
        ),
      }}
    />
  )
}
