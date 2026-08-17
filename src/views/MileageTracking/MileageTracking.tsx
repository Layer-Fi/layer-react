import { useTranslation } from 'react-i18next'

import { GlobalYearPicker } from '@blocks/DatePickers/GlobalYearPicker/GlobalYearPicker'
import { View } from '@blocks/Layout/View/View'
import { MileageTrackingStats } from '@features/mileage/MileageTrackingStats/MileageTrackingStats'
import { TripsRouter } from '@features/mileage/TripsRouter/TripsRouter'

export const MileageTracking = ({ showTitle = true }: { showTitle?: boolean }) => {
  const { t } = useTranslation()

  return (
    <View
      title={t('views:MileageTracking.label.mileage_tracking', 'Mileage Tracking')}
      showHeader={showTitle}
      header={<GlobalYearPicker />}
    >
      <MileageTrackingStats />
      <TripsRouter />
    </View>
  )
}
