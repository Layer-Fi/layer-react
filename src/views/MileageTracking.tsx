import { View } from '@components/View/View'
import { Trips } from '@components/Trips/Trips'

export const unstable_MileageTracking = ({ showTitle = true }: { showTitle?: boolean }) => {
  return (
    <View title='Mileage Tracking' showHeader={showTitle}>
      <Trips />
    </View>
  )
}
