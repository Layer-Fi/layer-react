import { SelectionIndicator } from 'react-aria-components/SelectionIndicator'
import { ToggleButton } from 'react-aria-components/ToggleButton'
import { useTranslation } from 'react-i18next'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip/Tooltip'
import { Span } from '@ui/Typography/Text'

import './toggleOption.scss'

const legacyClassNames = createLegacyClassNames({
  Layer__UI__ToggleOption__SelectionIndicator: 'Layer__UI__ToggleOption-SelectionIndicator',
  Layer__UI__ToggleOption__Content: 'Layer__UI__Toggle-Option-Content',
})

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
      <SelectionIndicator className={legacyClassNames('Layer__UI__ToggleOption__SelectionIndicator')} />
      <Span className={legacyClassNames('Layer__UI__ToggleOption__Content')}>
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
          {disabledMessageText}
        </TooltipContent>
      </Tooltip>
    )
  }

  return button
}
