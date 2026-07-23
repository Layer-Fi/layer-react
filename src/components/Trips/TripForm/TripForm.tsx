import { type ReactNode, useCallback } from 'react'
import { type CalendarDate } from '@internationalized/date'
import { AlertTriangle, Save } from 'lucide-react'
import type React from 'react'
import { useTranslation } from 'react-i18next'

import { type Trip, TripPurpose } from '@schemas/trip'
import { Button } from '@ui/Button/Button'
import { Form } from '@ui/Form/Form'
import { HStack, VStack } from '@ui/Stack/Stack'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { TripAddressComboBox } from '@components/Trips/TripAddressComboBox/TripAddressComboBox'
import { useTripForm } from '@components/Trips/TripForm/useTripForm'
import { TripPurposeComboBox } from '@components/Trips/TripPurposeComboBox/TripPurposeComboBox'
import { ErrorText } from '@components/Typography/ErrorText'
import { VehicleSelector } from '@components/VehicleManagement/VehicleSelector/VehicleSelector'

import './tripForm.scss'

function FieldErrors({ errors }: { errors: ReadonlyArray<unknown> }) {
  if (errors.length === 0) return null

  return (
    <HStack justify='end' className='Layer__TripForm__FieldError'>
      <ErrorText size='xs'>{errors[0] as ReactNode}</ErrorText>
    </HStack>
  )
}

export type TripFormProps = {
  trip?: Trip
  isReadOnly?: boolean
  onSuccess: (trip: Trip) => void
}

export const TripForm = (props: TripFormProps) => {
  const { t } = useTranslation()
  const { onSuccess, trip, isReadOnly } = props
  const { form, submitError, isDistanceUncalculatable } = useTripForm({ onSuccess, trip })

  // Prevents default browser form submission behavior
  const blockNativeOnSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <Form className='Layer__TripForm' onSubmit={blockNativeOnSubmit}>
      {submitError && (
        <HStack className='Layer__TripForm__FormError'>
          <DataState
            icon={<AlertTriangle size={16} />}
            status={DataStateStatus.failed}
            title={submitError}
            titleSize='md'
            inline
          />
        </HStack>
      )}

      <form.AppField name='tripDate'>
        {field => (
          <field.FormDateField<CalendarDate>
            label={t('trips:label.trip_date', 'Trip date')}
            inline
            isReadOnly={isReadOnly}
            className='Layer__TripForm__Field__TripDate'
          />
        )}
      </form.AppField>

      <form.Field name='start'>
        {field => (
          <TripAddressComboBox
            label={t('trips:label.start_address', 'Start address')}
            address={field.state.value.address}
            onAddressChange={field.handleChange}
            isReadOnly={isReadOnly}
            className='Layer__TripForm__Field__StartAddress'
          />
        )}
      </form.Field>

      <form.Field name='end'>
        {field => (
          <TripAddressComboBox
            label={t('trips:label.end_address', 'End address')}
            address={field.state.value.address}
            onAddressChange={field.handleChange}
            isReadOnly={isReadOnly}
            className='Layer__TripForm__Field__EndAddress'
          />
        )}
      </form.Field>

      <form.AppField name='distance'>
        {field => (
          <field.FormNonRecursiveBigDecimalField
            label={t('trips:label.distance_miles', 'Distance (miles)')}
            inline
            isReadOnly={isReadOnly}
            maxDecimalPlaces={2}
            placeholder={t('trips:label.enter_distance', 'Enter distance')}
            className='Layer__TripForm__Field__Distance'
          />
        )}
      </form.AppField>

      {isDistanceUncalculatable && (
        <FieldErrors
          errors={[t(
            'trips:error.distance_uncalculatable',
            'A route between these addresses could not be found. Enter the distance manually.',
          )]}
        />
      )}

      <form.Field name='purpose'>
        {field => (
          <>
            <TripPurposeComboBox
              value={field.state.value}
              onValueChange={value => field.handleChange(value ?? TripPurpose.Unreviewed)}
              isReadOnly={isReadOnly}
              className='Layer__TripForm__Field__Purpose'
            />
            <FieldErrors errors={field.state.meta.errors} />
          </>
        )}
      </form.Field>

      <form.AppField name='description'>
        {field => (
          <field.FormTextAreaField
            label={t('common:label.description', 'Description')}
            inline
            isReadOnly={isReadOnly}
            placeholder={t('common:action.add_description', 'Add description')}
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
            placeholder={t('vehicles:action.add_vehicle_label', 'Add vehicle')}
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
                {t('trips:action.save_trip', 'Save Trip')}
              </Button>
            )}
          </form.Subscribe>
        </VStack>
      )}
    </Form>
  )
}
