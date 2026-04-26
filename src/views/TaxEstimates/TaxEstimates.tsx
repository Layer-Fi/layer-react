import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { OnboardingStatus, useTaxEstimatesOnboardingStatus } from '@hooks/features/taxEstimates/useTaxEstimatesOnboardingStatus'
import { TaxEstimatesRouteStoreProvider } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { TaxEstimatesContextProvider, type TaxEstimatesContextProviderProps } from '@contexts/TaxEstimatesContext/TaxEstimatesContextProvider'
import { View } from '@components/View/View'
import { TaxEstimatesViewContent } from '@views/TaxEstimates/TaxEstimatesViewContent'
import { TaxEstimatesViewHeader } from '@views/TaxEstimates/TaxEstimatesViewHeader'

export type TaxEstimatesProps = TaxEstimatesContextProviderProps

export const TaxEstimates = ({ onClickReviewTransactions: onReviewClicked }: TaxEstimatesProps) => {
  return (
    <TaxEstimatesContextProvider onClickReviewTransactions={onReviewClicked}>
      <TaxEstimatesRouteStoreProvider>
        <TaxEstimatesView />
      </TaxEstimatesRouteStoreProvider>
    </TaxEstimatesContextProvider>
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
