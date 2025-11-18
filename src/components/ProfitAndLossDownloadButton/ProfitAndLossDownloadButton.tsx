import { useContext } from 'react'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { ProfitAndLossFullReportDownloadButton } from '@components/ProfitAndLossDownloadButton/ProfitAndLossFullReportDownloadButton'
import { type ProfitAndLossDownloadButtonStringOverrides } from '@components/ProfitAndLossDownloadButton/types'
import type { MoneyFormat } from '@internal-types/general'
import { ProfitAndLossDetailLinesDownloadButton } from '@components/ProfitAndLossDownloadButton/ProfitAndLossDetailLinesDownloadButton'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'

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
