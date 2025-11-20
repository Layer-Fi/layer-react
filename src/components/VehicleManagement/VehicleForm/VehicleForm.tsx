import { useCallback } from 'react'
import { AlertTriangle } from 'lucide-react'
import type React from 'react'

import { type Vehicle } from '@schemas/vehicle'
import { flattenValidationErrors } from '@utils/form'
import { Button } from '@ui/Button/Button'
import { Form } from '@ui/Form/Form'
import { HStack, VStack } from '@ui/Stack/Stack'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { TextSize } from '@components/Typography/Text'
import { useVehicleForm } from '@components/VehicleManagement/VehicleForm/useVehicleForm'

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

      <form.AppField name='makeAndModel'>
        {field => (
          <field.FormTextField
            label='Make and model'
            inline
            isReadOnly={isReadOnly}
            placeholder='Enter vehicle make and model'
            className={`${VEHICLE_FORM_FIELD_CSS_PREFIX}__MakeAndModel`}
          />
        )}
      </form.AppField>

      <form.AppField name='year'>
        {field => (
          <field.FormNumberField
            maxValue={9999}
            label='Year'
            inline
            isReadOnly={isReadOnly}
            placeholder='Enter vehicle year'
            className={`${VEHICLE_FORM_FIELD_CSS_PREFIX}__Year`}
          />
        )}
      </form.AppField>

      <form.AppField name='licensePlate'>
        {field => (
          <field.FormTextField
            label='License plate'
            inline
            isReadOnly={isReadOnly}
            placeholder='Enter license plate'
            className={`${VEHICLE_FORM_FIELD_CSS_PREFIX}__LicensePlate`}
          />
        )}
      </form.AppField>

      <form.AppField name='vin'>
        {field => (
          <field.FormTextField
            label='VIN'
            inline
            isReadOnly={isReadOnly}
            placeholder='Enter VIN'
            className={`${VEHICLE_FORM_FIELD_CSS_PREFIX}__Vin`}
          />
        )}
      </form.AppField>

      <form.AppField name='description'>
        {field => (
          <field.FormTextAreaField
            label='Description'
            inline
            isReadOnly={isReadOnly}
            placeholder='Add description'
            className={`${VEHICLE_FORM_FIELD_CSS_PREFIX}__Description`}
          />
        )}
      </form.AppField>

      <VStack justify='end' className={`${VEHICLE_FORM_CSS_PREFIX}__Submit`}>
        <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type='submit'
              isDisabled={!canSubmit}
              isPending={isSubmitting}
              onPress={() => { void form.handleSubmit() }}
            >
              Save Vehicle
            </Button>
          )}
        </form.Subscribe>
      </VStack>
    </Form>
  )
}
