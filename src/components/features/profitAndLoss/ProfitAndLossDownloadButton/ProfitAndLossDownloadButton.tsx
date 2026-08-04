import { useContext } from 'react'

import type { MoneyFormat } from '@internal-types/general'
import { ProfitAndLossContext } from '@providers/profitAndLoss/ProfitAndLossContext/ProfitAndLossContext'
import { ProfitAndLossDetailLinesDownloadButton } from '@features/profitAndLoss/ProfitAndLossDownloadButton/ProfitAndLossDetailLinesDownloadButton'
import { ProfitAndLossFullReportDownloadButton } from '@features/profitAndLoss/ProfitAndLossDownloadButton/ProfitAndLossFullReportDownloadButton'
import { type ProfitAndLossDownloadButtonStringOverrides } from '@features/profitAndLoss/ProfitAndLossDownloadButton/types'

type ProfitAndLossDownloadButtonProps = {
  stringOverrides?: ProfitAndLossDownloadButtonStringOverrides
  moneyFormat?: MoneyFormat
  icon?: boolean
}

export function ProfitAndLossDownloadButton({
  stringOverrides,
  moneyFormat,
  icon,
}: ProfitAndLossDownloadButtonProps) {
  const { selectedLineItem } = useContext(ProfitAndLossContext)

  if (selectedLineItem) {
    return (
      <ProfitAndLossDetailLinesDownloadButton
        pnlStructureLineItemName={selectedLineItem.lineItemName}
        stringOverrides={stringOverrides}
        icon={icon}
      />
    )
  }

  return (
    <ProfitAndLossFullReportDownloadButton
      stringOverrides={stringOverrides}
      moneyFormat={moneyFormat}
      icon={icon}
    />
  )
}
