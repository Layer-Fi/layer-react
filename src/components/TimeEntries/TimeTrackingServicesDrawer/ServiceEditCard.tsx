import { useCallback, useEffect, useState } from 'react'
import { Archive } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useIntl } from 'react-intl'

import { type CatalogService } from '@schemas/catalogService'
import { convertCentsToDecimalString } from '@utils/format'
import { toLocalizedCents } from '@utils/i18n/number/input'
import { useUpdateCatalogService } from '@hooks/api/businesses/[business-id]/catalog/services/[service-id]/useUpdateCatalogService'
import { Button } from '@ui/Button/Button'
import { FieldError, TextField } from '@ui/Form/Form'
import { Input } from '@ui/Input/Input'
import { InputGroup } from '@ui/Input/InputGroup'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'

import { HourlyRateField } from './HourlyRateField'

type ServiceEditCardProps = {
  service: CatalogService
  onCollapse: () => void
  onOpenArchive: () => void
}

const getHourlyRateInputValue = (service: CatalogService) => (
  service.billableRatePerHourAmount != null && !Number.isNaN(service.billableRatePerHourAmount)
    ? convertCentsToDecimalString(service.billableRatePerHourAmount)
    : ''
)

export const ServiceEditCard = ({ service, onCollapse, onOpenArchive }: ServiceEditCardProps) => {
  const { t } = useTranslation()
  const intl = useIntl()
  const { trigger: updateService, isMutating } = useUpdateCatalogService({ serviceId: service.id })
  const [name, setName] = useState(service.name)
  const [hourlyRaw, setHourlyRaw] = useState(() => getHourlyRateInputValue(service))
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    setName(service.name)
    setHourlyRaw(getHourlyRateInputValue(service))
    setSaveError(null)
  }, [service])

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
      await updateService({
        name: trimmed,
        billable_rate_per_hour_amount: billableRatePerHourAmount,
      })
      onCollapse()
    }
    catch {
      setSaveError(t('timeTracking:error.update_service', 'Could not save this service. Please try again.'))
    }
  }, [hourlyRaw, intl.locale, name, onCollapse, t, updateService])

  return (
    <VStack className='Layer__TimeTrackingServicesDrawer__editForm' gap='md'>
      <TextField
        name={`service-name-${service.id}`}
        className='Layer__TimeTrackingServicesDrawer__rateField'
      >
        <Label slot='label' size='sm' htmlFor={`service-name-${service.id}`} pbe='3xs'>
          {t('timeTracking:services.service_name', 'Service name')}
        </Label>
        <InputGroup slot='input'>
          <Input
            id={`service-name-${service.id}`}
            name={`service-name-${service.id}`}
            value={name}
            onChange={e => setName(e.target.value)}
            inset
          />
        </InputGroup>
      </TextField>
      <VStack className='Layer__TimeTrackingServicesDrawer__rateField'>
        <Label size='sm' htmlFor={`service-rate-${service.id}`} pbe='3xs'>
          {t('timeTracking:services.hourly_rate_optional', 'Default hourly rate (optional)')}
        </Label>
        <HourlyRateField
          inputId={`service-rate-${service.id}`}
          name={`service-rate-${service.id}`}
          value={hourlyRaw}
          onChange={setHourlyRaw}
        />
      </VStack>
      {saveError && <FieldError>{saveError}</FieldError>}
      <HStack className='Layer__TimeTrackingServicesDrawer__cardActions' gap='sm' align='center'>
        <Button variant='outlined' onPress={onOpenArchive}>
          <Archive size={16} />
          {t('timeTracking:services.archive', 'Archive')}
        </Button>
        <Button onPress={() => void onSave()} isDisabled={isMutating}>
          {t('timeTracking:services.save', 'Save')}
        </Button>
      </HStack>
    </VStack>
  )
}
