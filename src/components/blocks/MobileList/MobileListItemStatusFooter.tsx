import type { LucideIcon } from 'lucide-react'

import type { BadgeVariant } from '@ui/Badge/Badge'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './mobileListItemStatusFooter.scss'

const CSS_PREFIX = 'Layer__UI__MobileListItemStatusFooter'

type MobileListItemStatusFooterProps = {
  variant: BadgeVariant
  text: string
  subText?: string
  slots?: {
    Icon?: LucideIcon
  }
}

export const MobileListItemStatusFooter = ({
  variant,
  text,
  subText,
  slots,
}: MobileListItemStatusFooterProps) => {
  const Icon = slots?.Icon

  return (
    <HStack align='center' justify='space-between' className={CSS_PREFIX} data-status-variant={variant}>
      <HStack align='center' gap='2xs'>
        {Icon
          ? <Icon size={14} className={`${CSS_PREFIX}__Icon`} />
          : <span className={`${CSS_PREFIX}__Dot`} />}
        <Span weight='bold' size='sm'>{text}</Span>
      </HStack>
      {subText && <Span variant='subtle' size='sm'>{subText}</Span>}
    </HStack>
  )
}
