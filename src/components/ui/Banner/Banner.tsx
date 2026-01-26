import { forwardRef, type PropsWithChildren, type ReactNode } from 'react'
import classNames from 'classnames'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'

import './banner.scss'

export const BANNER_CLASS_NAMES = {
  DEFAULT: 'Layer__UI__Banner',
  ICON_CONTAINER: 'Layer__UI__Banner__iconContainer',
  CONTENT: 'Layer__UI__Banner__content',
  TITLE: 'Layer__UI__Banner__title',
  DESCRIPTION: 'Layer__UI__Banner__description',
  ACTIONS: 'Layer__UI__Banner__actions',
}

export type BannerVariant = 'default' | 'info' | 'warning' | 'error' | 'success'

export type BannerProps = PropsWithChildren<{
  variant?: BannerVariant
  icon?: ReactNode
  title?: string
  description?: string
  action?: ReactNode
  className?: string
  ariaLabel?: string
}>

type AriaProperties = {
  'role': 'alert' | 'status' | 'region'
  'aria-atomic'?: boolean
  'aria-label'?: string
}

function getAriaProperties(
  variant: BannerVariant,
  ariaLabel?: string,
): AriaProperties {
  switch (variant) {
    case 'error':
    case 'warning':
      return { 'role': 'alert', 'aria-atomic': true }
    case 'success':
    case 'info':
      return { 'role': 'status', 'aria-atomic': true }
    case 'default':
    default:
      return { 'role': 'region', 'aria-label': ariaLabel ?? 'Notification' }
  }
}

function BannerContent({
  title,
  description,
  children,
}: PropsWithChildren<{
  title?: string
  description?: string
}>) {
  if (title || description) {
    return (
      <VStack gap='3xs' className={BANNER_CLASS_NAMES.CONTENT}>
        {title && (
          <Heading level={3} size='sm' className={BANNER_CLASS_NAMES.TITLE}>
            {title}
          </Heading>
        )}
        {description && (
          <Span className={BANNER_CLASS_NAMES.DESCRIPTION}>
            {description}
          </Span>
        )}
      </VStack>
    )
  }

  return (
    <HStack fluid className={BANNER_CLASS_NAMES.CONTENT}>
      {children}
    </HStack>
  )
}

const Banner = forwardRef<HTMLDivElement, BannerProps>((
  {
    variant = 'info',
    icon,
    title,
    description,
    action,
    children,
    className,
    ariaLabel,
  },
  ref,
) => {
  const dataProperties = toDataProperties({ variant })
  const ariaProperties = getAriaProperties(variant, ariaLabel)

  return (
    <HStack
      ref={ref}
      gap='md'
      align='center'
      justify='space-between'
      className={classNames(BANNER_CLASS_NAMES.DEFAULT, className)}
      {...dataProperties}
      {...ariaProperties}
    >
      {icon && (
        <span className={BANNER_CLASS_NAMES.ICON_CONTAINER}>{icon}</span>
      )}
      <BannerContent title={title} description={description}>
        {children}
      </BannerContent>
      {action && (
        <HStack gap='sm' align='center' className={BANNER_CLASS_NAMES.ACTIONS}>
          {action}
        </HStack>
      )}
    </HStack>
  )
})
Banner.displayName = 'Banner'

export { Banner }
