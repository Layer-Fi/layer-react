import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { TripFormAddress } from '@schemas/mileage/trip'
import { useGetMileageAddressDetails } from '@api/businesses/[business-id]/mileage/address-details/get'
import { MIN_ADDRESS_QUERY_LENGTH, useGetMileageAddressSuggestions } from '@api/businesses/[business-id]/mileage/address-suggestions/get'
import { SearchComboBox, useSearchComboBox } from '@ui/ComboBox/SearchComboBox'
import type { ComboBoxOption } from '@ui/ComboBox/types'
import { P } from '@ui/Typography/Text'
import { ComboBoxField } from '@blocks/Form/ComboBoxField'

type TripAddressComboBoxProps = {
  label: string
  address: string
  onAddressChange: (selection: TripFormAddress) => void
  isReadOnly?: boolean
  inline?: boolean
  className?: string
}

export const TripAddressComboBox = ({
  label,
  address,
  onAddressChange,
  isReadOnly,
  inline,
  className,
}: TripAddressComboBoxProps) => {
  const { t } = useTranslation()
  const { searchQuery, isSearchEnabled, searchComboBoxProps } = useSearchComboBox({
    minQueryLength: MIN_ADDRESS_QUERY_LENGTH,
  })

  const [sessionToken, setSessionToken] = useState(() => crypto.randomUUID())
  const [pendingSelection, setPendingSelection] = useState<{ placeId: string, label: string } | null>(null)

  const {
    data: suggestions,
    isLoading,
    isError,
  } = useGetMileageAddressSuggestions({
    query: searchQuery,
    sessionToken,
    isEnabled: isSearchEnabled,
  })

  const { data: details } = useGetMileageAddressDetails({
    placeId: pendingSelection?.placeId ?? '',
    sessionToken,
    isEnabled: pendingSelection !== null,
  })

  useEffect(() => {
    if (pendingSelection === null || details?.placeId !== pendingSelection.placeId) return

    const { placeId, latitude, longitude } = details
    onAddressChange({ address: pendingSelection.label, place: { placeId, latitude, longitude } })
    setPendingSelection(null)
    setSessionToken(crypto.randomUUID())
  }, [details, pendingSelection, onAddressChange])

  const options = useMemo(() => (suggestions ?? []).map(({ description, placeId }) => ({
    label: description,
    value: placeId,
  })), [suggestions])

  const selectedValue = useMemo(() => (address ? { label: address, value: address } : null), [address])

  const handleSelectedValueChange = useCallback(
    (option: ComboBoxOption | null) => {
      if (option === null) {
        setPendingSelection(null)
        searchComboBoxProps.onSearchQueryChange('')
        onAddressChange({ address: '', place: null })
        return
      }

      onAddressChange({
        address: option.label,
        place: { placeId: option.value, latitude: null, longitude: null },
      })
      setPendingSelection({ placeId: option.value, label: option.label })
    },
    [onAddressChange, searchComboBoxProps],
  )

  const EmptyMessage = useMemo(
    () => (
      <P variant='subtle'>
        {t('trips:empty.address_suggestions', 'Type to search for an address')}
      </P>
    ),
    [t],
  )

  return (
    <ComboBoxField label={label} className={className} inline={inline}>
      {controlProps => (
        <SearchComboBox
          {...controlProps}
          {...searchComboBoxProps}
          options={options}
          selectedValue={selectedValue}
          onSelectedValueChange={handleSelectedValueChange}
          isReadOnly={isReadOnly}
          isLoading={isLoading}
          isError={isError}
          placeholder={t('trips:label.enter_address', 'Enter address')}
          slots={{
            EmptyMessage,
            ErrorMessage: t('trips:error.load_address_suggestions', 'An error occurred while loading address suggestions.'),
          }}
        />
      )}
    </ComboBoxField>
  )
}
