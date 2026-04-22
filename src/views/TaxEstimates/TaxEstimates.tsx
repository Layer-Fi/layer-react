import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { OnboardingStatus, TaxEstimatesRouteStoreProvider, useTaxEstimatesOnboardingStatus } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { TaxEstimatesProvider, type TaxEstimatesProviderProps } from '@contexts/TaxEstimatesContext/TaxEstimatesContext'
import { View } from '@components/View/View'
import { TaxEstimatesViewContent } from '@views/TaxEstimates/TaxEstimatesViewContent'
import { TaxEstimatesViewHeader } from '@views/TaxEstimates/TaxEstimatesViewHeader'

export type TaxEstimatesProps = Omit<TaxEstimatesProviderProps, 'children'>

export const TaxEstimates = ({ onTaxBannerReviewClick }: TaxEstimatesProps) => {
  return (
    <TaxEstimatesProvider onTaxBannerReviewClick={onTaxBannerReviewClick}>
      <TaxEstimatesRouteStoreProvider>
        <TaxEstimatesView />
      </TaxEstimatesRouteStoreProvider>
    </TaxEstimatesProvider>
  )
}

const TaxEstimatesView = () => {
  const { t } = useTranslation()
  const onboardingStatus = useTaxEstimatesOnboardingStatus()

  const header = useMemo(
    () => onboardingStatus === OnboardingStatus.Onboarded && <TaxEstimatesViewHeader />,
    [onboardingStatus],
  )

  return (
    <View title={t('common:label.tax_estimates', 'Tax estimates')} header={header}>
      <TaxEstimatesViewContent />
    </View>
  )
}
