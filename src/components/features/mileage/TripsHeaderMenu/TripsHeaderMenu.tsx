import { useMemo } from 'react'
import { Car } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useTripsNavigation } from '@providers/mileage/TripsRouteStore/TripsRouteStoreProvider'
import { type DropdownMenuItem } from '@ui/DropdownMenu/DropdownMenu'
import { DataTableHeaderMenu } from '@blocks/DataTable/DataTableHeaderMenu'

enum TripsHeaderMenuActions {
  ManageVehicles = 'ManageVehicles',
}

export const TripsHeaderMenu = () => {
  const { t } = useTranslation()
  const { toVehicles } = useTripsNavigation()

  const menuItems = useMemo<DropdownMenuItem[]>(() => [
    {
      key: TripsHeaderMenuActions.ManageVehicles,
      onClick: toVehicles,
      slots: { Icon: Car },
      label: t('vehicles:action.manage_vehicles', 'Manage vehicles'),
    },
  ], [t, toVehicles])

  return (
    <DataTableHeaderMenu
      ariaLabel={t('trips:label.additional_trip_actions', 'Additional trips actions')}
      items={menuItems}
    />
  )
}
