import { useCallback, useState } from 'react'

import { useTaxDetails } from '@hooks/taxEstimates/useTaxDetails'
import { useTaxSummary } from '@hooks/taxEstimates/useTaxSummary'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'

import './taxDetails.scss'

import { TaxDetailsDesktop } from './TaxDetailsDesktop'
import { TaxDetailsMobile } from './TaxDetailsMobile'

export type ExpandedState = {
  taxableIncome: boolean
  federalTaxes: boolean
  stateTaxes: boolean
}

export const TaxDetails = () => {
  const { year } = useTaxEstimatesYear()
  const { data, isLoading, isError } = useTaxDetails({ year })
  const { data: summaryData, isLoading: isSummaryLoading } = useTaxSummary({ year })
  const { isDesktop } = useSizeClass()

  const [expanded, setExpanded] = useState<ExpandedState>({
    taxableIncome: true,
    federalTaxes: true,
    stateTaxes: true,
  })

  const toggleExpanded = useCallback((key: keyof ExpandedState) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const sharedProps = {
    summaryData,
    isSummaryLoading,
    data,
    isLoading,
    isError,
    expanded,
    toggleExpanded,
  }

  if (isDesktop) {
    return <TaxDetailsDesktop {...sharedProps} />
  }

  return <TaxDetailsMobile {...sharedProps} />
}
