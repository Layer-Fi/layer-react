import { Trips } from '@components/Trips/Trips'
import { View } from '@components/View/View'

export const unstable_MileageTracking = ({ showTitle = true }: { showTitle?: boolean }) => {
  return (
    <View title='Mileage Tracking' showHeader={showTitle}>
      <Trips />
    </View>
  )
}
