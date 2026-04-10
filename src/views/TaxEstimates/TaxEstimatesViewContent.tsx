import { useTranslation } from 'react-i18next'

import { OnboardingStatus, useTaxEstimatesOnboardingStatus } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { Container } from '@components/Container/Container'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Loader } from '@components/Loader/Loader'
import { type TaxBannerReviewHandler } from '@components/TaxDetails/TaxBanner'
import { TaxProfile } from '@views/TaxEstimates/TaxProfile'

import { TaxEstimatesOnboardedViewContent } from './TaxEstimatesOnboardedViewContent'

export type TaxEstimatesViewContentProps = {
  onPressReviewButton: TaxBannerReviewHandler
  onboardingStatus: OnboardingStatus
}

export const TaxEstimatesViewContent = ({ onPressReviewButton }: TaxEstimatesViewContentProps) => {
  const { t } = useTranslation()
  const onboardingStatus = useTaxEstimatesOnboardingStatus()

  if (onboardingStatus === OnboardingStatus.FeatureDisabled) {
    return (
      <Container name='tax-estimates'>
        <DataState
          status={DataStateStatus.info}
          title={t('common:state.feature_not_enabled', 'Feature not enabled')}
          description={t(
            'taxEstimates:error.feature_not_enabled',
            'Tax estimates are not enabled.',
          )}
          spacing
        />
      </Container>
    )
  }

  if (onboardingStatus === OnboardingStatus.NotOnboarded) {
    return <TaxProfile />
  }

  if (onboardingStatus === OnboardingStatus.Loading) {
    return (
      <Container name='tax-estimates'>
        <Loader />
      </Container>
    )
  }

  if (onboardingStatus === OnboardingStatus.Error) {
    return (
      <Container name='tax-estimates'>
        <DataState status={DataStateStatus.failed} title={t('taxEstimates:error.load_tax_information', 'Unable to load tax information')} description={t('taxEstimates:error.retrieve_tax_profile', 'We couldn’t retrieve your tax profile. Please check your connection and try again.')} spacing />
      </Container>
    )
  }

  return <TaxEstimatesOnboardedViewContent onPressReviewButton={onPressReviewButton} />
}
