import { TextSize } from '@components/Typography/Text'
import { Button } from '@ui/Button/Button'
import React, { useCallback } from 'react'
import { type Vehicle } from '@schemas/vehicle'
import { Form } from '@ui/Form/Form'
import { HStack, VStack } from '@ui/Stack/Stack'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { AlertTriangle } from 'lucide-react'
import { useVehicleForm } from '@components/VehicleManagement/VehicleForm/useVehicleForm'
import { flattenValidationErrors } from '@utils/form'
import './vehicleForm.scss'

const VEHICLE_FORM_CSS_PREFIX = 'Layer__VehicleForm'
const VEHICLE_FORM_FIELD_CSS_PREFIX = `${VEHICLE_FORM_CSS_PREFIX}__Field`

export type VehicleFormProps = {
  vehicle?: Vehicle
  isReadOnly?: boolean
  onSuccess: (vehicle: Vehicle) => void
}

export const VehicleForm = (props: VehicleFormProps) => {
  const { onSuccess, vehicle, isReadOnly } = props
  const { form, submitError } = useVehicleForm({ onSuccess, vehicle })

  // Prevents default browser form submission behavior
  const blockNativeOnSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <Form className={VEHICLE_FORM_CSS_PREFIX} onSubmit={blockNativeOnSubmit}>
      <form.Subscribe selector={state => state.errorMap}>
        {(errorMap) => {
          const validationErrors = flattenValidationErrors(errorMap)
          if (validationErrors.length > 0 || submitError) {
            return (
              <HStack className={`${VEHICLE_FORM_CSS_PREFIX}__FormError`}>
                <DataState
                  icon={<AlertTriangle size={16} />}
                  status={DataStateStatus.failed}
                  title={validationErrors[0] || submitError}
                  titleSize={TextSize.md}
                  inline
                />
              </HStack>
            )
          }
        }}
      </form.Subscribe>

      <form.AppField name='make'>
        {field => <field.FormTextField label='Make' inline className={`${VEHICLE_FORM_FIELD_CSS_PREFIX}__Make`} isReadOnly={isReadOnly} />}
      </form.AppField>

      <form.AppField name='model'>
        {field => <field.FormTextField label='Model' inline className={`${VEHICLE_FORM_FIELD_CSS_PREFIX}__Model`} isReadOnly={isReadOnly} />}
      </form.AppField>

      <form.AppField name='year'>
        {field => <field.FormNumberField maxValue={9999} label='Year' inline className={`${VEHICLE_FORM_FIELD_CSS_PREFIX}__Year`} isReadOnly={isReadOnly} />}
      </form.AppField>

      <form.AppField name='licensePlate'>
        {field => <field.FormTextField label='License plate' inline className={`${VEHICLE_FORM_FIELD_CSS_PREFIX}__LicensePlate`} isReadOnly={isReadOnly} />}
      </form.AppField>

      <form.AppField name='vin'>
        {field => <field.FormTextField label='VIN' inline className={`${VEHICLE_FORM_FIELD_CSS_PREFIX}__Vin`} isReadOnly={isReadOnly} />}
      </form.AppField>

      <form.AppField name='description'>
        {field => <field.FormTextAreaField label='Description' inline className={`${VEHICLE_FORM_FIELD_CSS_PREFIX}__Description`} isReadOnly={isReadOnly} />}
      </form.AppField>

      <VStack justify='end' className={`${VEHICLE_FORM_CSS_PREFIX}__Submit`}>
        <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type='submit' isDisabled={!canSubmit} isPending={isSubmitting} onPress={() => { void form.handleSubmit() }}>
              Save Vehicle
            </Button>
          )}
        </form.Subscribe>
      </VStack>
    </Form>
  )
}
