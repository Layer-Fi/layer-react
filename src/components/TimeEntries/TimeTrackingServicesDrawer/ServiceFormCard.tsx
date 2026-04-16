import { type FormEvent, useCallback } from 'react'
import { Archive } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type CatalogService } from '@schemas/catalogService'
import { Button } from '@ui/Button/Button'
import { FieldError, Form, TextField } from '@ui/Form/Form'
import { Input } from '@ui/Input/Input'
import { InputGroup } from '@ui/Input/InputGroup'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Label, Span } from '@ui/Typography/Text'
import { AmountInput } from '@components/Input/AmountInput'

import { useServiceForm } from './useServiceForm'

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
      <HStack align='center' pis='sm' pie='sm'>
        <Span size='sm' variant='subtle'>
          {t('timeTracking:services.rate_per_hour_suffix', '/hr')}
        </Span>
      </HStack>
    </HStack>
  )
}

export function ServiceFormCard(props: ServiceFormCardProps) {
  const { t } = useTranslation()
  const { form, submitError } = useServiceForm(props)
  const mode = props.mode
  const service = mode === 'edit' ? props.service : undefined
  const nameId = service ? `service-name-${service.id}` : 'add-service-name'
  const rateId = service ? `service-rate-${service.id}` : 'add-service-rate'
  const isSubmitting = form.state.isSubmitting

  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }, [form])

  let actionButtons

  if (mode === 'edit') {
    actionButtons = (
      <HStack gap='sm' align='center' justify='space-between'>
        <Button variant='outlined' onPress={props.onArchive}>
          <Archive size={16} />
          {t('timeTracking:services.archive', 'Archive')}
        </Button>
        <Button onPress={() => { void form.handleSubmit() }} isDisabled={isSubmitting} isPending={isSubmitting}>
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
        <Button onPress={() => { void form.handleSubmit() }} isDisabled={isSubmitting} isPending={isSubmitting}>
          {t('timeTracking:services.save', 'Save')}
        </Button>
      </HStack>
    )
  }

  return (
    <Form
      className={
        mode === 'edit'
          ? 'Layer__TimeTrackingServicesDrawer__editForm'
          : 'Layer__TimeTrackingServicesDrawer__addCard'
      }
      onSubmit={onSubmit}
    >
      <VStack gap='md' pb='md' pi='md'>
        {mode === 'create' && (
          <Span size='sm' weight='bold'>
            {t('timeTracking:services.add_service', 'Add service')}
          </Span>
        )}

        <form.Field name='name'>
          {field => (
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
                  value={field.state.value}
                  onChange={e => field.handleChange(e.target.value)}
                  inset
                />
              </InputGroup>
              {field.state.meta.errors.length > 0 && (
                <FieldError>{field.state.meta.errors[0]}</FieldError>
              )}
            </TextField>
          )}
        </form.Field>

        <VStack className='Layer__TimeTrackingServicesDrawer__rateField'>
          <Label size='sm' htmlFor={rateId} pbe='3xs'>
            {t('timeTracking:services.hourly_rate_optional', 'Default hourly rate (optional)')}
          </Label>
          <form.Field name='hourlyRaw'>
            {field => (
              <HourlyRateField
                inputId={rateId}
                name={rateId}
                value={field.state.value}
                onChange={field.handleChange}
              />
            )}
          </form.Field>
        </VStack>

        {submitError && <FieldError>{submitError}</FieldError>}
        {actionButtons}
      </VStack>
    </Form>
  )
}
