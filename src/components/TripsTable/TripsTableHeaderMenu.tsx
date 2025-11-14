import { useMemo } from 'react'
import { Car } from 'lucide-react'
import { DataTableHeaderMenu, type DataTableHeaderMenuItem } from '@components/DataTable/DataTableHeaderMenu'

enum TripsTableHeaderMenuActions {
  ManageVehicles = 'ManageVehicles',
}

export const TripsTableHeaderMenu = () => {
  const menuItems = useMemo<DataTableHeaderMenuItem[]>(() => [
    {
      key: TripsTableHeaderMenuActions.ManageVehicles,
      onClick: () => {},
      icon: <Car size={16} strokeWidth={1.25} />,
      label: 'Manage vehicles',
    },
  ], [])

  return (
    <DataTableHeaderMenu
      ariaLabel='Additional trips actions'
      items={menuItems}
    />
  )
}
