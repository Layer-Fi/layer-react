import type { TaxSummary } from '@schemas/taxEstimates/summary'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { ResponsiveComponent } from '@ui/ResponsiveComponent/ResponsiveComponent'

import './taxSummaryCard.scss'

import { TaxSummaryCardDesktop } from './TaxSummaryCardDesktop'
import { TaxSummaryCardMobile } from './TaxSummaryCardMobile'

type TaxSummaryCardProps = {
  data: TaxSummary
}

export const TaxSummaryCard = ({ data }: TaxSummaryCardProps) => {
  const { isDesktop } = useSizeClass()

  return (
    <ResponsiveComponent
      slots={{
        Desktop: <TaxSummaryCardDesktop data={data} />,
        Mobile: <TaxSummaryCardMobile data={data} />,
      }}
      resolveVariant={() => (isDesktop ? 'Desktop' : 'Mobile')}
    />
  )
}
