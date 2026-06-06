import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip/Tooltip'

type LinkAccountDemoTooltipProps = {
  active: boolean
  asChild?: boolean
  children: ReactNode
}

export const LinkAccountDemoTooltip = ({ active, asChild = false, children }: LinkAccountDemoTooltipProps) => {
  const { t } = useTranslation()

  if (!active) {
    return <>{children}</>
  }

  return (
    <Tooltip placement='top'>
      <TooltipTrigger asChild={asChild}>
        {children}
      </TooltipTrigger>
      <TooltipContent width='sm'>
        <span className='Layer__UI__tooltip-content--text'>
          {t(
            'linkedAccounts:tooltip.cannot_link_demo_business',
            'Account linking is not available for demo businesses. This is a sample business that uses example data instead of real bank connections.',
          )}
        </span>
      </TooltipContent>
    </Tooltip>
  )
}
