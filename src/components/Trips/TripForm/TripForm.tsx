import { useCallback } from 'react'
import { type CalendarDate } from '@internationalized/date'
import { AlertTriangle, Save } from 'lucide-react'
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

export type TripFormProps = {
  trip?: Trip
  isReadOnly?: boolean
  isMobileDrawer?: boolean
  onSuccess: (trip: Trip) => void
}

export const TripForm = (props: TripFormProps) => {
  const { onSuccess, trip, isReadOnly, isMobileDrawer } = props
  const { form, submitError } = useTripForm({ onSuccess, trip })

  // Prevents default browser form submission behavior
  const blockNativeOnSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <Form className='Layer__TripForm' onSubmit={blockNativeOnSubmit}>
      <form.Subscribe selector={state => state.errorMap}>
        {(errorMap) => {
          const validationErrors = flattenValidationErrors(errorMap)
          if (validationErrors.length > 0 || submitError) {
            return (
              <HStack className='Layer__TripForm__FormError'>
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
        {field => (
          <field.FormDateField<CalendarDate>
            label='Trip date'
            inline
            isReadOnly={isReadOnly}
            className='Layer__TripForm__Field__TripDate'
          />
        )}
      </form.AppField>

      <form.AppField name='distance'>
        {field => (
          <field.FormBigDecimalField
            label='Distance (miles)'
            inline
            isReadOnly={isReadOnly}
            maxDecimalPlaces={2}
            placeholder='Enter distance'
            className='Layer__TripForm__Field__Distance'
          />
        )}
      </form.AppField>

      <form.AppField name='startAddress'>
        {field => (
          <field.FormTextField
            label='Start address'
            inline
            isReadOnly={isReadOnly}
            placeholder='Enter address'
            className='Layer__TripForm__Field__StartAddress'
          />
        )}
      </form.AppField>

      <form.AppField name='endAddress'>
        {field => (
          <field.FormTextField
            label='End address'
            inline
            isReadOnly={isReadOnly}
            placeholder='Enter address'
            className='Layer__TripForm__Field__EndAddress'
          />
        )}
      </form.AppField>

      <form.Field name='purpose'>
        {field => (
          <TripPurposeComboBox
            value={field.state.value}
            onValueChange={value => field.handleChange(value ?? TripPurpose.Unreviewed)}
            isReadOnly={isReadOnly}
            className='Layer__TripForm__Field__Purpose'
          />
        )}
      </form.Field>

      <form.AppField name='description'>
        {field => (
          <field.FormTextAreaField
            label='Description'
            inline
            isReadOnly={isReadOnly}
            placeholder='Add description'
            className='Layer__TripForm__Field__Description'
          />
        )}
      </form.AppField>

      <form.Field name='vehicle'>
        {field => (
          <VehicleSelector
            selectedVehicle={field.state.value}
            onSelectedVehicleChange={field.handleChange}
            isReadOnly={isReadOnly}
            inline
            placeholder='Add vehicle'
            menuPlacement={isMobileDrawer ? 'top' : undefined}
            containerClassName='Layer__TripForm__Field__Vehicle'
          />
        )}
      </form.Field>

      {!isReadOnly && (
        <VStack justify='end' className='Layer__TripForm__Submit'>
          <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button
                type='submit'
                isDisabled={!canSubmit}
                isPending={isSubmitting}
                onPress={() => { void form.handleSubmit() }}
              >
                <Save size={14} />
                Save Trip
              </Button>
            )}
          </form.Subscribe>
        </VStack>
      )}
    </Form>
  )
}
