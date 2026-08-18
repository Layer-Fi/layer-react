import { useTranslation } from 'react-i18next'

import { withUsageTracking } from '@components/utility/withUsageTracking'
import { GlobalYearPicker } from '@blocks/DatePickers/GlobalYearPicker/GlobalYearPicker'
import { Header } from '@blocks/Layout/Header/Header'
import { HeaderCol } from '@blocks/Layout/Header/HeaderCol'
import { HeaderRow } from '@blocks/Layout/Header/HeaderRow'
import { View } from '@blocks/Layout/View/View'
import { MileageTrackingStats } from '@features/mileage/MileageTrackingStats/MileageTrackingStats'
import { TripsRouter } from '@features/mileage/TripsRouter/TripsRouter'

const MileageTrackingComponent = ({ showTitle = true }: { showTitle?: boolean }) => {
  const { t } = useTranslation()

  return (
    <View
      title={t('views:MileageTracking.label.mileage_tracking', 'Mileage Tracking')}
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
      <TripsRouter />
    </View>
  )
}

export const MileageTracking = withUsageTracking('MileageTracking', MileageTrackingComponent)
