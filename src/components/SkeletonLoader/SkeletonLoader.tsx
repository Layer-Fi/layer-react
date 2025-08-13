import classNames from 'classnames'
import type { PropsWithChildren } from 'react'

export interface SkeletonLoaderProps {
  width?: string
  height?: string
  className?: string
}

export const SkeletonLoader = ({
  height,
  width,
  className,
}: SkeletonLoaderProps) => {
  const baseClassName = classNames(
    'Layer__skeleton-loader Layer__anim--skeleton-loading',
    className,
  )
  return <div className={baseClassName} style={{ width, height }} />
}

type FallbackWithSkeletonLoader = PropsWithChildren<SkeletonLoaderProps> & {
  isLoading: boolean
}

export const FallbackWithSkeletonLoader = ({
  height,
  width,
  isLoading,
  children,
  className,
}: FallbackWithSkeletonLoader) => {
  const baseClassName = classNames(
    'Layer__skeleton-loader Layer__anim--skeleton-loading',
    className,
  )

  if (isLoading) {
    return <div className={baseClassName} style={{ width, height }} />
  }

  return children
}
