import { useCallback, useEffect, useState } from 'react'
import { Archive } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useIntl } from 'react-intl'

import { type CatalogService } from '@schemas/catalogService'
import { convertCentsToDecimalString } from '@utils/format'
import { toLocalizedCents } from '@utils/i18n/number/input'
import { useUpdateCatalogService } from '@hooks/api/businesses/[business-id]/catalog/services/[service-id]/useUpdateCatalogService'
import { useCreateCatalogService } from '@hooks/api/businesses/[business-id]/catalog/services/useCreateCatalogService'
import { Button } from '@ui/Button/Button'
import { FieldError, TextField } from '@ui/Form/Form'
import { Input } from '@ui/Input/Input'
import { InputGroup } from '@ui/Input/InputGroup'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Label, Span } from '@ui/Typography/Text'
import { AmountInput } from '@components/Input/AmountInput'

type AddServiceFormCardProps = {
  mode: 'create'
  onCancel: () => void
  onSuccess: () => void
}

type EditServiceFormCardProps = {
  mode: 'edit'
  service: CatalogService
  onArchive: () => void
  onSuccess: () => void
}

type ServiceFormCardProps = AddServiceFormCardProps | EditServiceFormCardProps

const getHourlyRateInputValue = (service?: CatalogService) => (
  service?.billableRatePerHourAmount != null && !Number.isNaN(service.billableRatePerHourAmount)
    ? convertCentsToDecimalString(service.billableRatePerHourAmount)
    : ''
)

type HourlyRateFieldProps = {
  inputId: string
  name: string
  value: string
  onChange: (value: string) => void
}

function HourlyRateField({ inputId, name, value, onChange }: HourlyRateFieldProps) {
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

export function ServiceFormCard(props: ServiceFormCardProps) {
  const { t } = useTranslation()
  const intl = useIntl()
  const mode = props.mode
  const service = mode === 'edit' ? props.service : undefined
  const { trigger: createService, isMutating: isCreating } = useCreateCatalogService()
  const serviceId = service?.id ?? ''
  const { trigger: updateService, isMutating: isUpdating } = useUpdateCatalogService({ serviceId })
  const [name, setName] = useState(service?.name ?? '')
  const [hourlyRaw, setHourlyRaw] = useState(() => getHourlyRateInputValue(service))
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (service) {
      setName(service.name)
      setHourlyRaw(getHourlyRateInputValue(service))
      setSaveError(null)
    }
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
      if (mode === 'edit') {
        await updateService({
          name: trimmed,
          billable_rate_per_hour_amount: billableRatePerHourAmount,
        })
      }
      else {
        await createService({
          name: trimmed,
          billable_rate_per_hour_amount: billableRatePerHourAmount,
        })
      }

      props.onSuccess()
    }
    catch {
      setSaveError(
        mode === 'edit'
          ? t('timeTracking:error.update_service', 'Could not save this service. Please try again.')
          : t('timeTracking:error.create_service', 'Failed to create service. Please try again.'),
      )
    }
  }, [createService, hourlyRaw, intl.locale, mode, name, props, t, updateService])

  const isMutating = mode === 'edit' ? isUpdating : isCreating
  const nameId = service ? `service-name-${service.id}` : 'add-service-name'
  const rateId = service ? `service-rate-${service.id}` : 'add-service-rate'
  let actionButtons

  if (mode === 'edit') {
    actionButtons = (
      <HStack className='Layer__TimeTrackingServicesDrawer__cardActions' gap='sm' align='center'>
        <Button variant='outlined' onPress={props.onArchive}>
          <Archive size={16} />
          {t('timeTracking:services.archive', 'Archive')}
        </Button>
        <Button onPress={() => void onSave()} isDisabled={isMutating}>
          {t('timeTracking:services.save', 'Save')}
        </Button>
      </HStack>
    )
  }
  else {
    actionButtons = (
      <HStack gap='sm' justify='end' align='center'>
        <Button variant='outlined' onPress={props.onCancel}>
          {t('timeTracking:services.cancel', 'Cancel')}
        </Button>
        <Button onPress={() => void onSave()} isDisabled={isMutating}>
          {t('timeTracking:services.save', 'Save')}
        </Button>
      </HStack>
    )
  }

  return (
    <VStack
      className={
        mode === 'edit'
          ? 'Layer__TimeTrackingServicesDrawer__editForm'
          : 'Layer__TimeTrackingServicesDrawer__addCard'
      }
      gap='md'
    >
      {mode === 'create' && (
        <Span className='Layer__TimeTrackingServicesDrawer__addCardTitle' size='sm' weight='bold'>
          {t('timeTracking:services.add_service', 'Add service')}
        </Span>
      )}
      <TextField
        name={nameId}
        className='Layer__TimeTrackingServicesDrawer__rateField'
      >
        <Label slot='label' size='sm' htmlFor={nameId} pbe='3xs'>
          {t('timeTracking:services.service_name', 'Service name')}
        </Label>
        <InputGroup slot='input'>
          <Input
            id={nameId}
            name={nameId}
            value={name}
            onChange={e => setName(e.target.value)}
            inset
          />
        </InputGroup>
      </TextField>
      <VStack className='Layer__TimeTrackingServicesDrawer__rateField'>
        <Label size='sm' htmlFor={rateId} pbe='3xs'>
          {t('timeTracking:services.hourly_rate_optional', 'Default hourly rate (optional)')}
        </Label>
        <HourlyRateField
          inputId={rateId}
          name={rateId}
          value={hourlyRaw}
          onChange={setHourlyRaw}
        />
      </VStack>
      {saveError && <FieldError>{saveError}</FieldError>}
      {actionButtons}
    </VStack>
  )
}
