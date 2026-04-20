import classNames from 'classnames'
import type { PropsWithChildren } from 'react'

export interface SkeletonLoaderProps {
  width?: string
  height?: string
  className?: string
  isRounded?: boolean
}

export const SkeletonLoader = ({
  height,
  width,
  className,
  isRounded = false,
}: SkeletonLoaderProps) => {
  const baseClassName = classNames(
    'Layer__skeleton-loader Layer__anim--skeleton-loading',
    className,
    isRounded && 'Layer__skeleton-loader--rounded',
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
