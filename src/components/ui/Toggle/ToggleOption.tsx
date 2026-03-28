import { SelectionIndicator, ToggleButton } from 'react-aria-components'
import { useTranslation } from 'react-i18next'

import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip/Tooltip'
import { Span } from '@ui/Typography/Text'

import './toggleOption.scss'

export interface ToggleOptionProps {
  label: string
  value: string
  disabled?: boolean
  disabledMessage?: string
}

export const ToggleOption = ({
  label,
  value,
  disabled = false,
  disabledMessage,
}: ToggleOptionProps) => {
  const { t } = useTranslation()
  const disabledMessageText = disabledMessage ?? t('common:state.disabled', 'Disabled')

  const button = (
    <ToggleButton id={value} className='Layer__UI__ToggleOption' isDisabled={disabled}>
      <SelectionIndicator className='Layer__UI__ToggleOption-SelectionIndicator' />
      <Span className='Layer__UI__Toggle-Option-Content'>
        <Span noWrap>{label}</Span>
      </Span>
    </ToggleButton>
  )

  if (disabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          <span className='Layer__UI__tooltip-content--text'>{disabledMessageText}</span>
        </TooltipContent>
      </Tooltip>
    )
  }

  return button
}
