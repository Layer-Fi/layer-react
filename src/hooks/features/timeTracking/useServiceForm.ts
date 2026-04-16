import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { useIntl } from 'react-intl'

import { type CatalogService } from '@schemas/catalogService'
import { convertCentsToDecimalString } from '@utils/format'
import { toLocalizedCents } from '@utils/i18n/number/input'
import { useUpdateCatalogService } from '@hooks/api/businesses/[business-id]/catalog/services/[service-id]/useUpdateCatalogService'
import { useCreateCatalogService } from '@hooks/api/businesses/[business-id]/catalog/services/useCreateCatalogService'
import { useAppForm } from '@hooks/features/forms/useForm'

type CreateServiceFormProps = {
  mode: 'create'
  onSuccess: () => void
}

type EditServiceFormProps = {
  mode: 'edit'
  service: CatalogService
  onSuccess: () => void
}

export type ServiceFormProps = CreateServiceFormProps | EditServiceFormProps

type ServiceFormValues = {
  name: string
  hourlyRaw: string
}

const getServiceFormDefaultValues = (service?: CatalogService): ServiceFormValues => ({
  name: service?.name ?? '',
  hourlyRaw: service?.billableRatePerHourAmount != null && !Number.isNaN(service.billableRatePerHourAmount)
    ? convertCentsToDecimalString(service.billableRatePerHourAmount)
    : '',
})

export function useServiceForm(props: ServiceFormProps) {
  const { t } = useTranslation()
  const intl = useIntl()
  const { mode, onSuccess } = props
  const service = props.mode === 'edit' ? props.service : undefined
  const serviceId = service?.id ?? ''
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { trigger: createService } = useCreateCatalogService()
  const { trigger: updateService } = useUpdateCatalogService({ serviceId })

  const formDefaults = useMemo(() => getServiceFormDefaultValues(service), [service])
  const defaultValuesRef = useRef<ServiceFormValues>(formDefaults)
  const defaultValues = defaultValuesRef.current

  const onSubmit = useCallback(async ({ value }: { value: ServiceFormValues }) => {
    const trimmedName = value.name.trim()
    const trimmedRate = value.hourlyRaw.trim()
    const billableRatePerHourAmount = trimmedRate === ''
      ? undefined
      : toLocalizedCents(trimmedRate, intl.locale)

    setSubmitError(null)

    try {
      if (mode === 'edit') {
        await updateService({
          name: trimmedName,
          billable_rate_per_hour_amount: billableRatePerHourAmount,
        })
      }
      else {
        await createService({
          name: trimmedName,
          billable_rate_per_hour_amount: billableRatePerHourAmount,
        })
      }

      onSuccess()
    }
    catch {
      setSubmitError(
        mode === 'edit'
          ? t('timeTracking:error.update_service', 'Could not save this service. Please try again.')
          : t('timeTracking:error.create_service', 'Failed to create service. Please try again.'),
      )
    }
  }, [createService, intl.locale, mode, onSuccess, t, updateService])

  const onDynamic = useCallback(({ value }: { value: ServiceFormValues }) => {
    if (value.name.trim() === '') {
      return [{ name: t('timeTracking:validation.service_name_required', 'Service name is a required field.') }]
    }

    return null
  }, [t])

  const validators = useMemo(() => ({ onDynamic }), [onDynamic])

  const form = useAppForm<ServiceFormValues>({
    defaultValues,
    onSubmit,
    validators,
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'submit',
    }),
    canSubmitWhenInvalid: true,
  })

  useEffect(() => {
    form.reset(formDefaults)
    setSubmitError(null)
  }, [form, formDefaults])

  return useMemo(
    () => ({ form, submitError }),
    [form, submitError],
  )
}
