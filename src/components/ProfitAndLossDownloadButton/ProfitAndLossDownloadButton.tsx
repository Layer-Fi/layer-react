import { useContext } from 'react'
import { ProfitAndLossContext } from '../../contexts/ProfitAndLossContext/ProfitAndLossContext'
import { ProfitAndLossFullReportDownloadButton } from './ProfitAndLossFullReportDownloadButton'
import { type ProfitAndLossDownloadButtonStringOverrides } from './types'
import type { MoneyFormat } from '../../types'
import { ProfitAndLossDetailLinesDownloadButton } from './ProfitAndLossDetailLinesDownloadButton'
import { useSizeClass } from '../../hooks/useWindowSize'

type ProfitAndLossDetailLinesDownloadButtonProps = {
  stringOverrides?: ProfitAndLossDownloadButtonStringOverrides
  moneyFormat?: MoneyFormat
}

export function ProfitAndLossDownloadButton({
  stringOverrides,
  moneyFormat,
}: ProfitAndLossDetailLinesDownloadButtonProps) {
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
