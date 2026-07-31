import { useTranslation } from 'react-i18next'

import { Header } from '@ui/Header/Header'
import { HeaderCol } from '@ui/Header/HeaderCol'
import { HeaderRow } from '@ui/Header/HeaderRow'
import { GlobalYearPicker } from '@components/GlobalYearPicker/GlobalYearPicker'
import { View } from '@components/View/View'
import { MileageTrackingStats } from '@features/mileage/MileageTrackingStats/MileageTrackingStats'
import { Trips } from '@features/mileage/Trips/Trips'

export const MileageTracking = ({ showTitle = true }: { showTitle?: boolean }) => {
  const { t } = useTranslation()

  return (
    <View
      title={t('mileageTracking:label.mileage_tracking', 'Mileage Tracking')}
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
