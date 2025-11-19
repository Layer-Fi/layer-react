import { Trips } from '@components/Trips/Trips'
import { View } from '@components/View/View'
import { MileageTrackingStats } from '@components/MileageTrackingStats/MileageTrackingStats'
import { GlobalYearPicker } from '@components/GlobalYearPicker/GlobalYearPicker'
import { Header } from '@components/Header/Header'
import { HeaderRow } from '@components/Header/HeaderRow'
import { HeaderCol } from '@components/Header/HeaderCol'

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
