import { type ReactNode, useCallback, useState } from 'react'

import { useElementSize } from '@hooks/useElementSize/useElementSize'

import './responsiveComponent.scss'

export type DefaultVariant = 'Desktop' | 'SmallDesktop' | 'Mobile'

export type VariantResolver<T extends string> = ({ width }: { width: number }) => T

export interface ResponsiveComponentProps<T extends string = DefaultVariant> {
  slots: Record<T, ReactNode>
  resolveVariant: VariantResolver<T>
}

export const ResponsiveComponent = <T extends string = DefaultVariant>({
  slots,
  resolveVariant,
}: ResponsiveComponentProps<T>) => {
  const [currentVariant, setCurrentVariant] = useState<T | null>(null)

  const handleResize = useCallback((_el: HTMLDivElement, _entry: ResizeObserverEntry, size: { width: number }) => {
    const resolver = resolveVariant
    const variant = resolver({ width: size.width })

    if (variant !== currentVariant) {
      setCurrentVariant(variant)
    }
  }, [resolveVariant, currentVariant])

  const containerRef = useElementSize<HTMLDivElement>(handleResize)

  return (
    <div
      ref={containerRef}
      className='Layer__ResponsiveComponent'
    >
      {currentVariant !== null && slots[currentVariant]}
    </div>
  )
}
