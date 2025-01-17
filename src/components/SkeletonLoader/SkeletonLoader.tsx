import classNames from 'classnames'

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
