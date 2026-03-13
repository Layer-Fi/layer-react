import { useMemo } from 'react'
import { Car } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useTripsNavigation } from '@providers/TripsRouteStore/TripsRouteStoreProvider'
import { DataTableHeaderMenu, type DataTableHeaderMenuItem } from '@components/DataTable/DataTableHeaderMenu'

enum TripsTableHeaderMenuActions {
  ManageVehicles = 'ManageVehicles',
}

export const TripsTableHeaderMenu = () => {
  const { t } = useTranslation()
  const { toVehicleManagement } = useTripsNavigation()

  const menuItems = useMemo<DataTableHeaderMenuItem[]>(() => [
    {
      key: TripsTableHeaderMenuActions.ManageVehicles,
      onClick: toVehicleManagement,
      icon: <Car size={20} strokeWidth={1.25} />,
      label: t('manageVehicles', 'Manage vehicles'),
    },
  ], [t, toVehicleManagement])

  return (
    <DataTableHeaderMenu
      ariaLabel={t('additionalTripsActions', 'Additional trips actions')}
      items={menuItems}
    />
  )
}
