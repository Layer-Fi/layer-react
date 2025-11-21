import { GlobalYearPicker } from '@components/GlobalYearPicker/GlobalYearPicker'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { MileageTrackingStats } from '@components/MileageTrackingStats/MileageTrackingStats'
import { Trips } from '@components/Trips/Trips'
import { View } from '@components/View/View'

export const unstable_MileageTracking = ({ showTitle = true }: { showTitle?: boolean }) => {
  return (
    <View
      title='Mileage Tracking'
      showHeader={showTitle}
      header={(
        <Header>
          <HeaderRow>
            <HeaderCol>
              <GlobalYearPicker />
            </HeaderCol>
          </HeaderRow>
        </Header>
      )}
    >
      <MileageTrackingStats />
      <Trips />
    </View>
  )
}
