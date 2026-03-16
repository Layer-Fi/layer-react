import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useTaxProfile } from '@hooks/api/businesses/[business-id]/tax-estimates/profile/useTaxProfile'
import {
  OnboardingStatus,
  TaxEstimatesRoute,
  useTaxEstimatesNavigation,
  useTaxEstimatesOnboardingStatus,
} from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import BackArrow from '@icons/BackArrow'
import { Heading } from '@ui/Typography/Heading'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'
import { TaxProfileForm } from '@components/TaxProfileForm/TaxProfileForm'

export const TaxProfile = () => {
  const { t } = useTranslation()
  const onboardingStatus = useTaxEstimatesOnboardingStatus()
  const navigate = useTaxEstimatesNavigation()
  const { data: taxProfile } = useTaxProfile()

  const handleGoBack = useCallback(() => {
    navigate(TaxEstimatesRoute.Estimates)
  }, [navigate])

  const TaxProfileHeader = useCallback(() => {
    return <Heading size='md'>{t('taxEstimates:taxProfile', 'Tax Profile')}</Heading>
  }, [t])

  return (
    <BaseDetailView
      slots={{ Header: TaxProfileHeader, BackIcon: BackArrow }}
      name='TaxProfile'
      onGoBack={onboardingStatus === OnboardingStatus.Onboarded ? handleGoBack : undefined}
    >
      <TaxProfileForm taxProfile={taxProfile} />
    </BaseDetailView>
  )
}
