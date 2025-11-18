import { useContext } from 'react'

import type { MoneyFormat } from '@internal-types/general'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
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

  const { value } = useSizeClass()
  const iconOnly = value !== 'desktop'

  if (selectedLineItem) {
    return (
      <ProfitAndLossDetailLinesDownloadButton
        pnlStructureLineItemName={selectedLineItem.lineItemName}
        stringOverrides={stringOverrides}
        iconOnly={iconOnly}
      />
    )
  }

  return (
    <ProfitAndLossFullReportDownloadButton
      stringOverrides={stringOverrides}
      moneyFormat={moneyFormat}
      iconOnly={iconOnly}
    />
  )
}
