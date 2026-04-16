import { useTranslation } from 'react-i18next'

import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { AmountInput } from '@components/Input/AmountInput'

type HourlyRateFieldProps = {
  inputId: string
  name: string
  value: string
  onChange: (value: string) => void
}

export function HourlyRateField({ inputId, name, value, onChange }: HourlyRateFieldProps) {
  const { t } = useTranslation()

  return (
    <HStack className='Layer__TimeTrackingServicesDrawer__rateInputRow'>
      <VStack className='Layer__TimeTrackingServicesDrawer__rateAmountWrap'>
        <AmountInput
          id={inputId}
          name={name}
          value={value}
          onChange={next => onChange(next ?? '')}
          className='Layer__TimeTrackingServicesDrawer__rateAmountInput'
        />
      </VStack>
      <Span className='Layer__TimeTrackingServicesDrawer__rateSuffix'>
        {t('timeTracking:services.rate_per_hour_suffix', '/hr')}
      </Span>
    </HStack>
  )
}
