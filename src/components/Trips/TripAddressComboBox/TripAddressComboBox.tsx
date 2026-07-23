import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { makeTripPlace, type TripFormAddress } from '@schemas/trip'
import { useMileageAddressDetails } from '@hooks/api/businesses/[business-id]/mileage/address-details/useMileageAddressDetails'
import { MIN_ADDRESS_QUERY_LENGTH, useMileageAddressSuggestions } from '@hooks/api/businesses/[business-id]/mileage/address-suggestions/useMileageAddressSuggestions'
import { SearchComboBox, useSearchComboBox } from '@ui/ComboBox/SearchComboBox'
import type { ComboBoxOption } from '@ui/ComboBox/types'
import { HStack } from '@ui/Stack/Stack'
import { Label, P } from '@ui/Typography/Text'

import './tripAddressComboBox.scss'

type TripAddressComboBoxProps = {
  label: string
  address: string
  onAddressChange: (selection: TripFormAddress) => void
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
  const { searchQuery, isSearchEnabled, searchComboBoxProps } = useSearchComboBox({
    minQueryLength: MIN_ADDRESS_QUERY_LENGTH,
  })

  const [sessionToken, setSessionToken] = useState(() => crypto.randomUUID())
  const [pendingSelection, setPendingSelection] = useState<{ placeId: string, label: string } | null>(null)

  const {
    data: suggestions,
    isLoading,
    isError,
  } = useMileageAddressSuggestions({
    query: searchQuery,
    sessionToken,
    isEnabled: isSearchEnabled,
  })

  const { data: details } = useMileageAddressDetails({
    placeId: pendingSelection?.placeId ?? '',
    sessionToken,
    isEnabled: pendingSelection !== null,
  })

  useEffect(() => {
    if (pendingSelection === null || details?.placeId !== pendingSelection.placeId) return

    onAddressChange({ address: pendingSelection.label, place: makeTripPlace(details) })
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
        onAddressChange({ address: '', place: null })
        return
      }

      onAddressChange({
        address: option.label,
        place: makeTripPlace({ placeId: option.value }),
      })
      setPendingSelection({ placeId: option.value, label: option.label })
    },
    [onAddressChange],
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
      <SearchComboBox
        {...searchComboBoxProps}
        options={options}
        selectedValue={selectedValue}
        onSelectedValueChange={handleSelectedValueChange}
        inputId={inputId}
        isReadOnly={isReadOnly}
        isLoading={isLoading}
        isError={isError}
        placeholder={t('trips:label.enter_address', 'Enter address')}
        slots={{
          EmptyMessage,
          ErrorMessage: t('trips:error.load_address_suggestions', 'An error occurred while loading address suggestions.'),
        }}
      />
    </HStack>
  )
}
