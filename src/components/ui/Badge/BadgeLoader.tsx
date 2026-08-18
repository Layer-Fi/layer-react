import classNames from 'classnames'
import { Check, CircleAlert, Loader, X } from 'lucide-react'

import { ROTATING_CLASS_NAME } from '@utils/shared/styles/animationClassNames'
import { createLegacyClassNames, type LegacyClassNameMapFor } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { LOADER_CLASS_NAME } from '@ui/Loader/Loader'

import './badgeLoader.scss'

export interface BadgeLoaderProps {
  size?: number
  variant?: 'default' | 'info' | 'success' | 'error' | 'warning'
  showLoading?: boolean
}

type BadgeLoaderVariant = NonNullable<BadgeLoaderProps['variant']>

const legacyClassNames = createLegacyClassNames({
  'state:asBadge': 'Layer__loader--as-badge',
  'variant:default': 'Layer__loader--default',
  'variant:info': 'Layer__loader--info',
  'variant:success': 'Layer__loader--success',
  'variant:error': 'Layer__loader--error',
  'variant:warning': 'Layer__loader--warning',
} satisfies LegacyClassNameMapFor<never, `variant:${BadgeLoaderVariant}` | `state:${string}`>)

const BadgeLoaderIcon = ({ variant, showLoading }: { variant: BadgeLoaderProps['variant'], showLoading?: boolean }) => {
  if (showLoading) return <Loader size={12} className={ROTATING_CLASS_NAME} />
  if (variant === 'success') return <Check size={12} />
  if (variant === 'error') return <X size={12} />
  if (variant === 'warning') return <CircleAlert size={12} />
  return <Loader size={12} className={ROTATING_CLASS_NAME} />
}

export const BadgeLoader = ({ showLoading, variant = 'default' }: BadgeLoaderProps) => {
  return (
    <span
      className={classNames(LOADER_CLASS_NAME, legacyClassNames('state:asBadge', `variant:${variant}`))}
      {...toDataProperties({ variant, 'as-badge': true })}
    >
      <BadgeLoaderIcon variant={variant} showLoading={showLoading} />
    </span>
  )
}
