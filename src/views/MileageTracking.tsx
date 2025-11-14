import { View } from '@components/View/View'
import { TripsTable } from '@components/TripsTable/TripsTable'

export const unstable_MileageTracking = ({ showTitle = true }: { showTitle?: boolean }) => {
  return (
    <View title='Mileage Tracking' showHeader={showTitle}>
      <TripsTable />
    </View>
  )
}
