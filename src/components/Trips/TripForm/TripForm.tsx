import { useCallback } from 'react'
import { type CalendarDate } from '@internationalized/date'
import { AlertTriangle } from 'lucide-react'
import type React from 'react'

import { type Trip, TripPurpose } from '@schemas/trip'
import { flattenValidationErrors } from '@utils/form'
import { Button } from '@ui/Button/Button'
import { Form } from '@ui/Form/Form'
import { HStack, VStack } from '@ui/Stack/Stack'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { useTripForm } from '@components/Trips/TripForm/useTripForm'
import { TripPurposeComboBox } from '@components/Trips/TripPurposeComboBox/TripPurposeComboBox'
import { TextSize } from '@components/Typography/Text'
import { VehicleSelector } from '@features/vehicles/components/VehicleSelector'

import './tripForm.scss'

const TRIP_FORM_CSS_PREFIX = 'Layer__TripForm'
const TRIP_FORM_FIELD_CSS_PREFIX = `${TRIP_FORM_CSS_PREFIX}__Field`

export type TripFormProps = {
  trip?: Trip
  isReadOnly?: boolean
  onSuccess: (trip: Trip) => void
}

export const TripForm = (props: TripFormProps) => {
  const { onSuccess, trip, isReadOnly } = props
  const { form, submitError } = useTripForm({ onSuccess, trip })

  // Prevents default browser form submission behavior
  const blockNativeOnSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <Form className={TRIP_FORM_CSS_PREFIX} onSubmit={blockNativeOnSubmit}>
      <form.Subscribe selector={state => state.errorMap}>
        {(errorMap) => {
          const validationErrors = flattenValidationErrors(errorMap)
          if (validationErrors.length > 0 || submitError) {
            return (
              <HStack className={`${TRIP_FORM_CSS_PREFIX}__FormError`}>
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

      <form.AppField name='tripDate'>
        {field => <field.FormDateField<CalendarDate> label='Trip date' inline className={`${TRIP_FORM_FIELD_CSS_PREFIX}__TripDate`} isReadOnly={isReadOnly} />}
      </form.AppField>

      <form.AppField name='distance'>
        {field => <field.FormBigDecimalField label='Distance (miles)' inline className={`${TRIP_FORM_FIELD_CSS_PREFIX}__Distance`} isReadOnly={isReadOnly} maxDecimalPlaces={2} placeholder='Enter distance' />}
      </form.AppField>

      <form.AppField name='startAddress'>
        {field => <field.FormTextField label='Start address' inline className={`${TRIP_FORM_FIELD_CSS_PREFIX}__StartAddress`} isReadOnly={isReadOnly} placeholder='Enter address' />}
      </form.AppField>

      <form.AppField name='endAddress'>
        {field => <field.FormTextField label='End address' inline className={`${TRIP_FORM_FIELD_CSS_PREFIX}__EndAddress`} isReadOnly={isReadOnly} placeholder='Enter address' />}
      </form.AppField>

      <form.Field name='purpose'>
        {field => (
          <TripPurposeComboBox
            className={`${TRIP_FORM_FIELD_CSS_PREFIX}__Purpose`}
            value={field.state.value}
            onValueChange={value => field.handleChange(value ?? TripPurpose.Unreviewed)}
            isReadOnly={isReadOnly}
          />
        )}
      </form.Field>

      <form.AppField name='description'>
        {field => (
          <field.FormTextAreaField label='Description' inline className={`${TRIP_FORM_FIELD_CSS_PREFIX}__Description`} isReadOnly={isReadOnly} placeholder='Add description' />
        )}
      </form.AppField>

      <form.Field name='vehicle'>
        {field => (
          <VehicleSelector
            selectedVehicle={field.state.value}
            onSelectedVehicleChange={field.handleChange}
            isReadOnly={isReadOnly}
            inline
            containerClassName={`${TRIP_FORM_FIELD_CSS_PREFIX}__Vehicle`}
            placeholder='Add vehicle'
          />
        )}
      </form.Field>

      <VStack justify='end' className={`${TRIP_FORM_CSS_PREFIX}__Submit`}>
        <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type='submit' isDisabled={!canSubmit} isPending={isSubmitting} onPress={() => { void form.handleSubmit() }}>
              Save Trip
            </Button>
          )}
        </form.Subscribe>
      </VStack>
    </Form>
  )
}
