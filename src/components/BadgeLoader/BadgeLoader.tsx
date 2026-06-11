import { type ReactNode } from 'react'
import { Check, CircleAlert, Loader, X } from 'lucide-react'
export interface BadgeLoaderProps {
  children?: ReactNode
  size?: number
  variant?: 'default' | 'info' | 'success' | 'error' | 'warning'
  showLoading?: boolean
}

const BadgeLoaderIcon = ({ variant, showLoading }: { variant: BadgeLoaderProps['variant'], showLoading?: boolean }) => {
  if (showLoading) return <Loader size={12} className='Layer__anim--rotating' />
  if (variant === 'success') return <Check size={12} />
  if (variant === 'error') return <X size={12} />
  if (variant === 'warning') return <CircleAlert size={12} />
  return <Loader size={12} className='Layer__anim--rotating' />
}

export const BadgeLoader = ({ children, showLoading, variant = 'default' }: BadgeLoaderProps) => {
  return (
    <span className={`Layer__loader Layer__loader--as-badge Layer__loader--${variant}`}>
      <BadgeLoaderIcon variant={variant} showLoading={showLoading} />
      {children}
    </span>
  )
}
