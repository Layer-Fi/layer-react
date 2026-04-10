import { useTranslation } from 'react-i18next'

import { TaxEstimatesRouteStoreProvider } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { Container } from '@components/Container/Container'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { View } from '@components/View/View'
import { TaxEstimatesViewContent } from '@views/TaxEstimates/TaxEstimatesViewContent'

export const TaxEstimatesView = () => {
  const { t } = useTranslation()
  const { accountingConfiguration } = useLayerContext()

  if (accountingConfiguration?.enableTaxEstimates === false) {
    return (
      <View title={t('common:label.taxes', 'Taxes')}>
        <Container name='tax-estimates'>
          <DataState
            status={DataStateStatus.failed}
            title={t('common:state.feature_not_enabled', 'Feature not enabled')}
            description={t(
              'common:label.feature_not_enabled_for_business',
              '{{featureName}} is not enabled.',
              { featureName: t('taxEstimates:label.tax_estimates', 'Tax estimates') },
            )}
            spacing
          />
        </Container>
      </View>
    )
  }

  return (
    <TaxEstimatesRouteStoreProvider>
      <TaxEstimatesViewContent />
    </TaxEstimatesRouteStoreProvider>
  )
}
