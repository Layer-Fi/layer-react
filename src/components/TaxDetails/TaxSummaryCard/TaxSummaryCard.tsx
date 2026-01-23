import type { TaxSummary } from '@schemas/taxEstimates/summary'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { TaxSummaryCardDesktop } from '@components/TaxDetails/TaxSummaryCard/TaxSummaryCardDesktop'
import { TaxSummaryCardMobile } from '@components/TaxDetails/TaxSummaryCard/TaxSummaryCardMobile'

import './taxSummaryCard.scss'

type TaxSummaryCardProps = {
  data: TaxSummary
}

export const TaxSummaryCard = ({ data }: TaxSummaryCardProps) => {
  const { isDesktop } = useSizeClass()

  if (isDesktop) {
    return <TaxSummaryCardDesktop data={data} />
  }

  return <TaxSummaryCardMobile data={data} />
}
