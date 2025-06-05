import { ReactNode } from 'react'
import LoaderIcon from '../../icons/Loader'
import CheckIcon from '../../icons/Check'
import XIcon from '../../icons/X'
import AlertCircle from '../../icons/AlertCircle'
export interface BadgeLoaderProps {
  children?: ReactNode
  size?: number
  variant?: 'default' | 'info' | 'success' | 'error' | 'warning'
}

const BadgeLoaderIcon = ({ variant }: { variant: BadgeLoaderProps['variant'] }) => {
  if (variant === 'success') return <CheckIcon size={12} />
  if (variant === 'error') return <XIcon size={12} />
  if (variant === 'warning') return <AlertCircle size={12} />
  return <LoaderIcon size={12} className='Layer__anim--rotating' />
}

export const BadgeLoader = ({ children, variant = 'default' }: BadgeLoaderProps) => {
  return (
    <span className={`Layer__loader Layer__loader--as-badge Layer__loader--${variant}`}>
      <BadgeLoaderIcon variant={variant} />
      {children}
    </span>
  )
}
