import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { Schema } from 'effect'
import { useTranslation } from 'react-i18next'

import { UpsertVehicleSchema, type Vehicle, type VehicleForm } from '@schemas/vehicle'
import { DateFormat } from '@utils/i18n/date/patterns'
import { UpsertVehicleMode, useUpsertVehicle } from '@hooks/api/businesses/[business-id]/mileage/vehicles/useUpsertVehicle'
import { useAppForm } from '@hooks/features/forms/useForm'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import {
  convertVehicleFormToUpsertVehicle,
  getVehicleFormDefaultValues,
  validateVehicleForm,
  VehicleFormInvalidReason,
} from '@components/VehicleManagement/VehicleForm/formUtils'

type onSuccessFn = (vehicle: Vehicle) => void
type UseVehicleFormProps = { onSuccess: onSuccessFn, vehicle?: Vehicle }

export const useVehicleForm = (props: UseVehicleFormProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { onSuccess, vehicle } = props

  const { trigger: upsertVehicle } = useUpsertVehicle(
    vehicle
      ? { mode: UpsertVehicleMode.Update, vehicleId: vehicle.id }
      : { mode: UpsertVehicleMode.Create },
  )

  const defaultValuesRef = useRef<VehicleForm>(getVehicleFormDefaultValues(vehicle))
  const defaultValues = defaultValuesRef.current

  const onSubmit = useCallback(async ({ value }: { value: VehicleForm }) => {
    try {
      const vehicleParams = convertVehicleFormToUpsertVehicle(value)
      const upsertVehicleRequest = Schema.encodeUnknownSync(UpsertVehicleSchema)(vehicleParams)
      const result = await upsertVehicle(upsertVehicleRequest)

      setSubmitError(undefined)
      onSuccess(result.data)
    }
    catch (e) {
      console.error(e)
      setSubmitError(t('common:error.something_went_wrong_please_try_again', 'Something went wrong. Please try again.'))
    }
  }, [onSuccess, upsertVehicle, t])

  const getErrorText = useCallback((reason: VehicleFormInvalidReason): string => {
    switch (reason) {
      case VehicleFormInvalidReason.MakeAndModelRequired:
        return t('vehicles:validation.make_model_required', 'Make and model is a required field.')
      case VehicleFormInvalidReason.YearRequired:
        return t('vehicles:validation.year_required', 'Year is a required field.')
      case VehicleFormInvalidReason.YearRange:
        return t('vehicles:validation.year_range', 'Year must be between 1900 and {{maxYear}}.', {
          maxYear: formatDate(new Date(new Date().getFullYear() + 1, 0, 1), DateFormat.Year),
        })
      default:
        return ''
    }
  }, [formatDate, t])

  const onDynamic = useCallback(({ value }: { value: VehicleForm }) => {
    const errors = validateVehicleForm({ vehicle: value })
    if (!errors) return null

    return errors.map(({ field, reason }) => ({ [field]: getErrorText(reason) }))
  }, [getErrorText])

  const validators = useMemo(() => ({ onDynamic }), [onDynamic])

  const form = useAppForm<VehicleForm>({
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
    form.reset(getVehicleFormDefaultValues(vehicle))
  }, [vehicle, form])

  return useMemo(() => ({ form, submitError }), [form, submitError])
}
