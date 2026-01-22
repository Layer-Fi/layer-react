import { useCallback } from 'react'

import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'
import { TaxPaymentsHeader } from '@components/TaxPayments/TaxPaymentsHeader'
import { TaxPaymentsTable } from '@components/TaxPayments/TaxPaymentsTable/TaxPaymentsTable'
import type { CommonTaxPaymentsListProps } from '@components/TaxPayments/utils'

export const TaxPaymentsDesktopView = (props: CommonTaxPaymentsListProps) => {
  const Header = useCallback(() => <TaxPaymentsHeader variant='Desktop' />, [])
  return (
    <BaseDetailView name='TaxPayments' slots={{ Header }}>
      <TaxPaymentsTable {...props} />
    </BaseDetailView>
  )
}
