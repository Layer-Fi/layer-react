import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useIntl } from 'react-intl'

import { toLocalizedCents } from '@utils/i18n/number/input'
import { useCreateCatalogService } from '@hooks/api/businesses/[business-id]/catalog/services/useCreateCatalogService'
import { Button } from '@ui/Button/Button'
import { FieldError, TextField } from '@ui/Form/Form'
import { Input } from '@ui/Input/Input'
import { InputGroup } from '@ui/Input/InputGroup'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Label, Span } from '@ui/Typography/Text'

import { HourlyRateField } from './HourlyRateField'

type AddServiceCardProps = {
  onCancel: () => void
  onCreated: () => void
}

export const AddServiceCard = ({ onCancel, onCreated }: AddServiceCardProps) => {
  const { t } = useTranslation()
  const intl = useIntl()
  const { trigger: createService, isMutating } = useCreateCatalogService()
  const [name, setName] = useState('')
  const [hourlyRaw, setHourlyRaw] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)

  const onSave = useCallback(async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setSaveError(t('timeTracking:validation.service_name_required', 'Service name is a required field.'))
      return
    }

    setSaveError(null)

    const trimmedRate = hourlyRaw.trim()
    const billableRatePerHourAmount = trimmedRate === ''
      ? undefined
      : toLocalizedCents(hourlyRaw, intl.locale)

    try {
      await createService({
        name: trimmed,
        billable_rate_per_hour_amount: billableRatePerHourAmount,
      })
      onCreated()
    }
    catch {
      setSaveError(t('timeTracking:error.create_service', 'Failed to create service. Please try again.'))
    }
  }, [createService, hourlyRaw, intl.locale, name, onCreated, t])

  return (
    <VStack className='Layer__TimeTrackingServicesDrawer__addCard' gap='md'>
      <Span className='Layer__TimeTrackingServicesDrawer__addCardTitle' size='sm' weight='bold'>
        {t('timeTracking:services.add_service', 'Add service')}
      </Span>
      <TextField
        name='add-service-name'
        className='Layer__TimeTrackingServicesDrawer__rateField'
      >
        <Label slot='label' size='sm' htmlFor='add-service-name' pbe='3xs'>
          {t('timeTracking:services.service_name', 'Service name')}
        </Label>
        <InputGroup slot='input'>
          <Input
            id='add-service-name'
            name='add-service-name'
            value={name}
            onChange={e => setName(e.target.value)}
            inset
          />
        </InputGroup>
      </TextField>
      <VStack className='Layer__TimeTrackingServicesDrawer__rateField'>
        <Label size='sm' htmlFor='add-service-rate' pbe='3xs'>
          {t('timeTracking:services.hourly_rate_optional', 'Default hourly rate (optional)')}
        </Label>
        <HourlyRateField
          inputId='add-service-rate'
          name='add-service-rate'
          value={hourlyRaw}
          onChange={setHourlyRaw}
        />
      </VStack>
      {saveError && <FieldError>{saveError}</FieldError>}
      <HStack gap='sm' justify='end' align='center'>
        <Button variant='outlined' onPress={onCancel}>
          {t('timeTracking:services.cancel', 'Cancel')}
        </Button>
        <Button onPress={() => void onSave()} isDisabled={isMutating}>
          {t('timeTracking:services.save', 'Save')}
        </Button>
      </HStack>
    </VStack>
  )
}
