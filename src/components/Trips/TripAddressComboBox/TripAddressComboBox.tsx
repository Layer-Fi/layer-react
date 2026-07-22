import { useCallback, useId, useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import type { TripPlace } from '@schemas/trip'
import { useMileageAddressLookup } from '@hooks/api/businesses/[business-id]/mileage/addresses/useMileageAddressLookup'
import { AsyncComboBox } from '@ui/ComboBox/AsyncComboBox'
import type { AsyncComboBoxFetchParams } from '@ui/ComboBox/types'
import { HStack } from '@ui/Stack/Stack'
import { Label, P } from '@ui/Typography/Text'

import './tripAddressComboBox.scss'

export type TripAddressSelection = {
  address: string
  place: TripPlace | null
}

type TripAddressComboBoxProps = {
  label: string
  address: string
  onAddressChange: (selection: TripAddressSelection | null) => void
  isReadOnly?: boolean
  className?: string
}

export const TripAddressComboBox = ({
  label,
  address,
  onAddressChange,
  isReadOnly,
  className,
}: TripAddressComboBoxProps) => {
  const { t } = useTranslation()
  const { fetchAddressSuggestions, fetchAddressDetails } = useMileageAddressLookup()

  const fetchOptions = useCallback(async ({ inputValue }: AsyncComboBoxFetchParams) => {
    const suggestions = await fetchAddressSuggestions(inputValue)

    return {
      options: suggestions.map(({ description, placeId }) => ({
        label: description,
        value: placeId,
      })),
    }
  }, [fetchAddressSuggestions])

  const selectedValue = useMemo(
    () => (address ? { label: address, value: address } : null),
    [address],
  )

  const handleSelectedValueChange = useCallback(
    (option: { label: string, value: string } | null) => {
      if (option === null) {
        onAddressChange(null)
        return
      }

      onAddressChange({
        address: option.label,
        place: { placeId: option.value, latitude: null, longitude: null },
      })

      void fetchAddressDetails(option.value)
        .then(({ placeId, formattedAddress, latitude, longitude }) => {
          onAddressChange({
            address: formattedAddress ?? option.label,
            place: { placeId, latitude: latitude ?? null, longitude: longitude ?? null },
          })
        })
        .catch(() => {
          /* The suggestion description and place ID are enough to save the trip */
        })
    },
    [onAddressChange, fetchAddressDetails],
  )

  const EmptyMessage = useMemo(
    () => (
      <P variant='subtle'>
        {t('trips:empty.address_suggestions', 'Type to search for an address')}
      </P>
    ),
    [t],
  )

  const inputId = useId()

  return (
    <HStack
      className={classNames(
        'Layer__TripAddressComboBox',
        'Layer__TripAddressComboBox--inline',
        className,
      )}
    >
      <Label size='sm' htmlFor={inputId}>
        {label}
      </Label>
      <AsyncComboBox
        fetchOptions={fetchOptions}
        selectedValue={selectedValue}
        onSelectedValueChange={handleSelectedValueChange}
        inputId={inputId}
        isReadOnly={isReadOnly}
        placeholder={t('trips:label.enter_address', 'Enter address')}
        slots={{
          EmptyMessage,
          ErrorMessage: t('trips:error.load_address_suggestions', 'An error occurred while loading address suggestions.'),
        }}
      />
    </HStack>
  )
}
