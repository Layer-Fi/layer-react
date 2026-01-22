import type { TaxSummary } from '@schemas/taxEstimates/summary'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'

import './taxSummaryCard.scss'

import { TaxSummaryCardDesktop } from './TaxSummaryCardDesktop'
import { TaxSummaryCardMobile } from './TaxSummaryCardMobile'

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
