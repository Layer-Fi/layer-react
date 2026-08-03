import { useCallback } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useGetTaxProfile } from '@api/businesses/[business-id]/tax-estimates/profile/get'
import {
  useTaxEstimatesNavigation,
} from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { Heading } from '@ui/Typography/Heading'
import { BaseDetailView } from '@blocks/layout/BaseDetailView/BaseDetailView'
import { TaxProfileForm } from '@features/taxEstimates/TaxProfileForm/TaxProfileForm'

export const TaxProfile = () => {
  const { t } = useTranslation()
  const navigate = useTaxEstimatesNavigation()
  const { data: taxProfile } = useGetTaxProfile()
  const hasSavedTaxProfile = taxProfile?.userHasSavedTaxProfile === true

  const handleGoBack = useCallback(() => {
    if (hasSavedTaxProfile) {
      navigate.toEstimates()
    }
  }, [navigate, hasSavedTaxProfile])

  const TaxProfileHeader = useCallback(() => {
    return <Heading size='md'>{t('taxEstimates:label.tax_profile', 'Tax Profile')}</Heading>
  }, [t])

  return (
    <BaseDetailView
      slots={{ Header: TaxProfileHeader, BackIcon: ChevronLeft }}
      name='TaxProfile'
      onGoBack={hasSavedTaxProfile ? handleGoBack : undefined}
    >
      <TaxProfileForm taxProfile={taxProfile} />
    </BaseDetailView>
  )
}
