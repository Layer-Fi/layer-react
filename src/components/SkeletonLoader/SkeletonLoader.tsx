import classNames from 'classnames'
import type { PropsWithChildren } from 'react'

export interface SkeletonLoaderProps {
  width?: string
  height?: string
  className?: string
  isCircle?: boolean
}

const BaseSkeletonLoader = ({
  height,
  width,
  className,
  isCircle = false,
}: SkeletonLoaderProps) => {
  const baseClassName = classNames(
    'Layer__skeleton-loader Layer__anim--skeleton-loading',
    className,
    isCircle && 'Layer__skeleton-loader--circle',
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

export const CircleSkeletonLoader = (props: SkeletonLoaderProps) => <BaseSkeletonLoader {...props} isCircle={true} />
export const SkeletonLoader = (props: SkeletonLoaderProps) => <BaseSkeletonLoader {...props} isCircle={false} />
