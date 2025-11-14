import { useMemo } from 'react'
import { Car } from 'lucide-react'
import { DataTableHeaderMenu, type DataTableHeaderMenuItem } from '@components/DataTable/DataTableHeaderMenu'
import { useTripsNavigation } from '@providers/TripsRouteStore/TripsRouteStoreProvider'

enum TripsTableHeaderMenuActions {
  ManageVehicles = 'ManageVehicles',
}

export const TripsTableHeaderMenu = () => {
  const { toVehicleManagement } = useTripsNavigation()

  const menuItems = useMemo<DataTableHeaderMenuItem[]>(() => [
    {
      key: TripsTableHeaderMenuActions.ManageVehicles,
      onClick: toVehicleManagement,
      icon: <Car size={16} strokeWidth={1.25} />,
      label: 'Manage vehicles',
    },
  ], [toVehicleManagement])

  return (
    <DataTableHeaderMenu
      ariaLabel='Additional trips actions'
      items={menuItems}
    />
  )
}
