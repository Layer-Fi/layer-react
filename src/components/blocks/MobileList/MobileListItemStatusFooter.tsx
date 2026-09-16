import classNames from 'classnames'
import type { LucideIcon } from 'lucide-react'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import type { BadgeVariant } from '@ui/Badge/Badge'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './mobileListItemStatusFooter.scss'

const legacyClassNames = createLegacyClassNames({
  Layer__MobileListItemStatusFooter: 'Layer__UI__MobileListItemStatusFooter',
  Layer__MobileListItemStatusFooter__Icon: 'Layer__UI__MobileListItemStatusFooter__Icon',
  Layer__MobileListItemStatusFooter__Dot: 'Layer__UI__MobileListItemStatusFooter__Dot',
})

type MobileListItemStatusFooterProps = {
  variant: BadgeVariant
  text: string
  subText?: string
  slots?: {
    Icon?: LucideIcon
  }
  legacyClassNames?: { root?: string, icon?: string, dot?: string }
}

export const MobileListItemStatusFooter = ({
  variant,
  text,
  subText,
  slots,
  legacyClassNames: callerLegacyClassNames,
}: MobileListItemStatusFooterProps) => {
  const Icon = slots?.Icon

  return (
    <HStack
      align='center'
      justify='space-between'
      className={classNames(legacyClassNames('Layer__MobileListItemStatusFooter'), callerLegacyClassNames?.root)}
      data-status-variant={variant}
    >
      <HStack align='center' gap='2xs'>
        {Icon
          ? <Icon size={14} className={classNames(legacyClassNames('Layer__MobileListItemStatusFooter__Icon'), callerLegacyClassNames?.icon)} />
          : <span className={classNames(legacyClassNames('Layer__MobileListItemStatusFooter__Dot'), callerLegacyClassNames?.dot)} />}
        <Span weight='bold' size='sm'>{text}</Span>
      </HStack>
      {subText && <Span variant='subtle' size='sm'>{subText}</Span>}
    </HStack>
  )
}
