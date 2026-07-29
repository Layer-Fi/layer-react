import { useCallback } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type Trip } from '@schemas/trip'
import { MobileListItemActionsMenu } from '@ui/MobileList/MobileListItemActionsMenu'
import { PaginatedMobileList } from '@ui/MobileList/PaginatedMobileList'
import type { TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'
import { TripsMobileHeader } from '@components/Trips/TripsMobileHeader/TripsMobileHeader'
import { TripsMobileListItem, TripsMobileListItemFooter } from '@components/Trips/TripsMobileList/TripsMobileListItem'

import './tripsMobileList.scss'

interface TripsMobileListProps {
  data: Trip[] | undefined
  isLoading: boolean
  isError: boolean
  onEditTrip: (trip: Trip) => void
  onDeleteTrip: (trip: Trip) => void
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
  onEditTrip,
  onDeleteTrip,
  onRecordTrip,
  paginationProps,
  slots,
}: TripsMobileListProps) => {
  const { t } = useTranslation()
  const renderItem = useCallback((trip: Trip) => <TripsMobileListItem trip={trip} />, [])
  const renderFooter = useCallback((trip: Trip) => <TripsMobileListItemFooter trip={trip} />, [])

  const renderActions = useCallback((trip: Trip) => (
    <MobileListItemActionsMenu
      ariaLabel={t('trips:label.trip_actions', 'Trip actions')}
      actions={[
        {
          key: 'edit',
          label: t('trips:action.edit_trip', 'Edit Trip'),
          icon: Pencil,
          onClick: () => onEditTrip(trip),
        },
        {
          key: 'delete',
          label: t('trips:action.delete_trip', 'Delete Trip'),
          icon: Trash2,
          onClick: () => onDeleteTrip(trip),
        },
      ]}
    />
  ), [t, onEditTrip, onDeleteTrip])

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
        renderActions={renderActions}
        paginationProps={paginationProps}
        slots={slots}
      />
    </div>
  )
}
