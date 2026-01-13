import { BREAKPOINTS } from '@config/general'
import { GlobalYearPicker } from '@components/GlobalYearPicker/GlobalYearPicker'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { MileageTrackingStats } from '@components/MileageTrackingStats/MileageTrackingStats'
import { Trips } from '@components/Trips/Trips'
import { ResponsiveComponent, type VariantResolver } from '@components/ui/ResponsiveComponent/ResponsiveComponent'
import { View } from '@components/View/View'

type MileageStatsVariant = 'Desktop' | 'Mobile'

const resolveVariant: VariantResolver<MileageStatsVariant> = ({ width }) => {
  return width <= BREAKPOINTS.TABLET ? 'Mobile' : 'Desktop'
}

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
      <ResponsiveComponent<MileageStatsVariant>
        resolveVariant={resolveVariant}
        slots={{
          Desktop: <MileageTrackingStats layout='horizontal' />,
          Mobile: <MileageTrackingStats layout='vertical' />,
        }}
      />
      <Trips />
    </View>
  )
}
