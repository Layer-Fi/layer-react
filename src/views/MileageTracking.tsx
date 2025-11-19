import { Trips } from '@components/Trips/Trips'
import { View } from '@components/View/View'
import { MileageTrackingStats } from '@components/MileageTrackingStats/MileageTrackingStats'

export const unstable_MileageTracking = ({ showTitle = true }: { showTitle?: boolean }) => {
  return (
    <View title='Mileage Tracking' showHeader={showTitle}>
      <MileageTrackingStats />
      <Trips />
    </View>
  )
}
