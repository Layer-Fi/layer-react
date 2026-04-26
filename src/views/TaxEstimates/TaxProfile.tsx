import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useTaxProfile } from '@hooks/api/businesses/[business-id]/tax-estimates/profile/useTaxProfile'
import {
  useTaxEstimatesNavigation,
} from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import BackArrow from '@icons/BackArrow'
import { Heading } from '@ui/Typography/Heading'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'
import { TaxProfileForm } from '@components/TaxProfileForm/TaxProfileForm'

export const TaxProfile = () => {
  const { t } = useTranslation()
  const navigate = useTaxEstimatesNavigation()
  const { data: taxProfile } = useTaxProfile()

  const handleGoBack = useCallback(() => {
    navigate.toEstimates()
  }, [navigate])

  const TaxProfileHeader = useCallback(() => {
    return <Heading size='md'>{t('taxEstimates:label.tax_profile', 'Tax Profile')}</Heading>
  }, [t])

  return (
    <BaseDetailView
      slots={{ Header: TaxProfileHeader, BackIcon: BackArrow }}
      name='TaxProfile'
      onGoBack={handleGoBack}
    >
      <TaxProfileForm taxProfile={taxProfile} />
    </BaseDetailView>
  )
}
