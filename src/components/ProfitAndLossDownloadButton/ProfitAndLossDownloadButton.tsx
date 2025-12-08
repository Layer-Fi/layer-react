import { useContext } from 'react'

import type { MoneyFormat } from '@internal-types/general'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { ProfitAndLossDetailLinesDownloadButton } from '@components/ProfitAndLossDownloadButton/ProfitAndLossDetailLinesDownloadButton'
import { ProfitAndLossFullReportDownloadButton } from '@components/ProfitAndLossDownloadButton/ProfitAndLossFullReportDownloadButton'
import { type ProfitAndLossDownloadButtonStringOverrides } from '@components/ProfitAndLossDownloadButton/types'

type ProfitAndLossDownloadButtonProps = {
  stringOverrides?: ProfitAndLossDownloadButtonStringOverrides
  moneyFormat?: MoneyFormat
}

export function ProfitAndLossDownloadButton({
  stringOverrides,
  moneyFormat,
}: ProfitAndLossDownloadButtonProps) {
  const { selectedLineItem } = useContext(ProfitAndLossContext)

  if (selectedLineItem) {
    return (
      <ProfitAndLossDetailLinesDownloadButton
        pnlStructureLineItemName={selectedLineItem.lineItemName}
        stringOverrides={stringOverrides}
      />
    )
  }

  return (
    <ProfitAndLossFullReportDownloadButton
      stringOverrides={stringOverrides}
      moneyFormat={moneyFormat}
    />
  )
}
