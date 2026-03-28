import { useTranslation } from 'react-i18next'

import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { Container } from '@components/Container/Container'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { GlobalYearPicker } from '@components/GlobalYearPicker/GlobalYearPicker'
import { Header } from '@components/Header/Header'
import { MileageTrackingStats } from '@components/MileageTrackingStats/MileageTrackingStats'
import { Trips } from '@components/Trips/Trips'
import { View } from '@components/View/View'

export const unstable_MileageTracking = ({ showTitle = true }: { showTitle?: boolean }) => {
  return <MileageTrackingViewContent showTitle={showTitle} />
}

const MileageTrackingViewContent = ({ showTitle }: { showTitle: boolean }) => {
  const { t } = useTranslation()
  const { accountingConfiguration } = useLayerContext()

  if (accountingConfiguration?.mileageTrackingEnabled === false) {
    return (
      <View
        title={t('mileageTracking:label.mileage_tracking', 'Mileage Tracking')}
        showHeader={showTitle}
      >
        <Container name='mileage-tracking'>
          <DataState
            status={DataStateStatus.failed}
            title={t('common:state.feature_not_enabled', 'Feature not enabled')}
            description={t(
              'common:label.feature_not_enabled_for_business',
              '{{featureName}} is not enabled.',
              { featureName: t('mileageTracking:label.mileage_tracking', 'Mileage Tracking') },
            )}
            spacing
          />
        </Container>
      </View>
    )
  }

  return (
    <View
      title={t('mileageTracking:label.mileage_tracking', 'Mileage Tracking')}
      showHeader={showTitle}
      header={(
        <Header>
          <GlobalYearPicker />
        </Header>
      )}
    >
      <MileageTrackingStats />
      <Trips />
    </View>
  )
}
