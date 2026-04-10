import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { OnboardingStatus, TaxEstimatesRouteStoreProvider, useTaxEstimatesOnboardingStatus } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { type TaxBannerReviewHandler } from '@components/TaxDetails/TaxBanner'
import { View } from '@components/View/View'
import { TaxEstimatesViewContent } from '@views/TaxEstimates/TaxEstimatesViewContent'
import { TaxEstimatesViewHeader } from '@views/TaxEstimates/TaxEstimatesViewHeader'

export type TaxEstimatesProps = {
  onPressReviewButton: TaxBannerReviewHandler
}

export const TaxEstimates = ({ onPressReviewButton }: TaxEstimatesProps) => {
  return (
    <TaxEstimatesRouteStoreProvider>
      <TaxEstimatesView onPressReviewButton={onPressReviewButton} />
    </TaxEstimatesRouteStoreProvider>
  )
}

const TaxEstimatesView = ({ onPressReviewButton }: TaxEstimatesProps) => {
  const { t } = useTranslation()
  const onboardingStatus = useTaxEstimatesOnboardingStatus()

  const header = useMemo(
    () => onboardingStatus === OnboardingStatus.Onboarded && <TaxEstimatesViewHeader />,
    [onboardingStatus],
  )

  return (
    <View title={t('taxEstimates:label.tax_estimates', 'Tax estimates')} header={header}>
      <TaxEstimatesViewContent onboardingStatus={onboardingStatus} onPressReviewButton={onPressReviewButton} />
    </View>
  )
}
