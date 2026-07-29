import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type Trip } from '@schemas/trip'
import { PaginatedMobileList } from '@ui/MobileList/PaginatedMobileList'
import type { TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'
import { TripsMobileHeader } from '@components/Trips/TripsMobileHeader/TripsMobileHeader'
import { TripsMobileListItem, TripsMobileListItemFooter } from '@components/Trips/TripsMobileList/TripsMobileListItem'

import './tripsMobileList.scss'

interface TripsMobileListProps {
  data: Trip[] | undefined
  isLoading: boolean
  isError: boolean
  onViewOrUpsertTrip: (trip: Trip) => void
  onRecordTrip: () => void
  paginationProps: TablePaginationProps
  slots: {
    EmptyState: React.FC
    ErrorState: React.FC
  }
}

export const TripsMobileList = ({
  data,
  isLoading,
  isError,
  onViewOrUpsertTrip,
  onRecordTrip,
  paginationProps,
  slots,
}: TripsMobileListProps) => {
  const { t } = useTranslation()
  const renderItem = useCallback((trip: Trip) => <TripsMobileListItem trip={trip} />, [])
  const renderFooter = useCallback((trip: Trip) => <TripsMobileListItemFooter trip={trip} />, [])

  return (
    <div className='Layer__TripsMobileList'>
      <TripsMobileHeader onRecordTrip={onRecordTrip} />
      <PaginatedMobileList
        ariaLabel={t('trips:label.trips', 'Trips')}
        data={data}
        isLoading={isLoading}
        isError={isError}
        renderItem={renderItem}
        renderFooter={renderFooter}
        paginationProps={paginationProps}
        onClickItem={onViewOrUpsertTrip}
        slots={slots}
      />
    </div>
  )
}
