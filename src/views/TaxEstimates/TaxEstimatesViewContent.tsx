import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { OnboardingStatus, useTaxEstimatesOnboardingStatus } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { Container } from '@components/Container/Container'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Loader } from '@components/Loader/Loader'
import { View } from '@components/View/View'
import { TaxProfile } from '@views/TaxEstimates/TaxProfile'

import { TaxEstimatesOnboardedViewContent } from './TaxEstimatesOnboardedViewContent'
import type { TaxEstimatesViewProps } from './taxEstimatesTypes'
import { TaxEstimatesViewHeader } from './TaxEstimatesViewHeader'

export const TaxEstimatesViewContent = ({ onTaxBannerReviewClick }: TaxEstimatesViewProps) => {
  const { t } = useTranslation()
  const onboardingStatus = useTaxEstimatesOnboardingStatus()

  const header = useMemo(
    () => onboardingStatus === OnboardingStatus.Onboarded && <TaxEstimatesViewHeader />,
    [onboardingStatus],
  )

  const viewContent = useMemo(() => {
    switch (onboardingStatus) {
      case OnboardingStatus.Loading:
        return (
          <Container name='tax-estimates'>
            <Loader />
          </Container>
        )

      case OnboardingStatus.Error:
        return (
          <Container name='tax-estimates'>
            <DataState
              status={DataStateStatus.failed}
              title={t('taxEstimates:error.load_tax_information', 'Unable to load tax information')}
              description={t('taxEstimates:error.retrieve_tax_profile', 'We couldn’t retrieve your tax profile. Please check your connection and try again.')}
              spacing
            />
          </Container>
        )

      case OnboardingStatus.Onboarded:
        return <TaxEstimatesOnboardedViewContent onTaxBannerReviewClick={onTaxBannerReviewClick} />

      case OnboardingStatus.NotOnboarded:
      default:
        return <TaxProfile />
    }
  }, [onTaxBannerReviewClick, onboardingStatus, t])

  return (
    <View title='Taxes' header={header}>
      {viewContent}
    </View>
  )
}
