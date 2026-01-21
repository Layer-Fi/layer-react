import { type ReactNode, useCallback, useState } from 'react'
import classNames from 'classnames'

import { type ElementSize, useElementSize } from '@hooks/useElementSize/useElementSize'

import './responsiveComponent.scss'

export type DefaultVariant = 'Desktop' | 'Mobile'

export type VariantResolver<T extends string> = ({ width }: { width: number }) => T

export interface ResponsiveComponentProps<T extends string = DefaultVariant> {
  slots: Record<T, ReactNode>
  resolveVariant: VariantResolver<T>
  className?: string
}

const CLASS_NAME = 'Layer__UI__ResponsiveComponent'

export const ResponsiveComponent = <T extends string = DefaultVariant>({
  slots,
  resolveVariant,
  className,
}: ResponsiveComponentProps<T>) => {
  const [currentVariant, setCurrentVariant] = useState<T | null>(null)

  const handleResize = useCallback((size: ElementSize) => {
    setCurrentVariant(resolveVariant({ width: size.width }))
  }, [resolveVariant])

  const containerRef = useElementSize<HTMLDivElement>(handleResize)

  return (
    <div ref={containerRef} className={classNames(CLASS_NAME, className)}>
      {currentVariant !== null && slots[currentVariant]}
    </div>
  )
}
