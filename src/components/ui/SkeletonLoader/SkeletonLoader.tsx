import classNames from 'classnames'
import type { PropsWithChildren } from 'react'

import { SKELETON_LOADING_CLASS_NAME } from '@utils/shared/styles/animationClassNames'
import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'

import './skeletonLoader.scss'

const legacyClassNames = createLegacyClassNames({
  'Layer__UI__SkeletonLoader': 'Layer__skeleton-loader',
  'state:circle': 'Layer__skeleton-loader--circle',
})

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
    legacyClassNames('Layer__UI__SkeletonLoader', isCircle && 'state:circle'),
    SKELETON_LOADING_CLASS_NAME,
    className,
  )
  return <div className={baseClassName} data-circle={isCircle || undefined} style={{ width, height }} />
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
    legacyClassNames('Layer__UI__SkeletonLoader'),
    SKELETON_LOADING_CLASS_NAME,
    className,
  )

  if (isLoading) {
    return <div className={baseClassName} style={{ width, height }} />
  }

  return children
}

export const CircleSkeletonLoader = (props: SkeletonLoaderProps) => <BaseSkeletonLoader {...props} isCircle={true} />
export const SkeletonLoader = (props: SkeletonLoaderProps) => <BaseSkeletonLoader {...props} isCircle={false} />
