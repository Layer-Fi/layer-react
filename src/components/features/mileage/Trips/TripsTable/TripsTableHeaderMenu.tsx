import { useMemo } from 'react'
import { Car } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useTripsNavigation } from '@providers/TripsRouteStore/TripsRouteStoreProvider'
import { type DropdownMenuItem } from '@ui/DropdownMenu/DropdownMenu'
import { DataTableHeaderMenu } from '@blocks/DataTable/DataTableHeaderMenu'

enum TripsTableHeaderMenuActions {
  ManageVehicles = 'ManageVehicles',
}

export const TripsTableHeaderMenu = () => {
  const { t } = useTranslation()
  const { toVehicleManagement } = useTripsNavigation()

  const menuItems = useMemo<DropdownMenuItem[]>(() => [
    {
      key: TripsTableHeaderMenuActions.ManageVehicles,
      onClick: toVehicleManagement,
      slots: { Icon: Car },
      label: t('vehicles:action.manage_vehicles', 'Manage vehicles'),
    },
  ], [t, toVehicleManagement])

  return (
    <DataTableHeaderMenu
      ariaLabel={t('trips:label.additional_trip_actions', 'Additional trips actions')}
      items={menuItems}
    />
  )
}
