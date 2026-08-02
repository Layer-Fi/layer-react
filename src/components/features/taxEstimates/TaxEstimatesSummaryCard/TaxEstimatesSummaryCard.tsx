import classNames from 'classnames'

import { DateFormat } from '@utils/i18n/date/patterns'
import { SummaryCard } from '@blocks/SummaryCard/SummaryCard'
import { type SummaryCardInteractionProps, type SummaryCardStringOverrides, useSummaryCardSlots } from '@blocks/SummaryCard/useSummaryCardSlots'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'
import { TaxEstimatesSummaryCardMode } from '@features/taxEstimates/TaxEstimatesSummaryCard/constants'
import { Content } from '@features/taxEstimates/TaxEstimatesSummaryCard/TaxEstimatesSummaryCardContent'
import { TaxEstimatesSummaryCardError as Error } from '@features/taxEstimates/TaxEstimatesSummaryCard/TaxEstimatesSummaryCardError'
import { TaxEstimatesSummaryCardLoading as Loading } from '@features/taxEstimates/TaxEstimatesSummaryCard/TaxEstimatesSummaryCardLoading'
import { useTaxEstimatesSummaryCard } from '@features/taxEstimates/TaxEstimatesSummaryCard/useTaxEstimatesSummaryCard'

import './taxEstimatesSummaryCard.scss'

export { TaxEstimatesSummaryCardMode }

export type TaxEstimatesSummaryCardProps = {
  mode?: TaxEstimatesSummaryCardMode
  interactionProps?: SummaryCardInteractionProps
  stringOverrides?: SummaryCardStringOverrides
}

export const TaxEstimatesSummaryCard = ({
  mode = TaxEstimatesSummaryCardMode.PieChart,
  interactionProps,
  stringOverrides,
}: TaxEstimatesSummaryCardProps = {}) => {
  const { title: defaultTitle, isLoading, isError, layout, detailData, state } = useTaxEstimatesSummaryCard()
  const isSummaryCardLayout = layout === 'summaryCard'

  const slots = useSummaryCardSlots({
    defaultTitle,
    interactionProps,
    stringOverrides,
    subtitleDateFormat: DateFormat.Year,
  })

  return (
    <SummaryCard
      className={classNames('Layer__TaxEstimatesSummaryCard', isSummaryCardLayout && 'Layer__TaxEstimatesSummaryCard--summaryCard')}
      slots={slots}
    >
      <ConditionalBlock
        data={detailData}
        isLoading={isLoading}
        isError={isError}
        Loading={(
          <Loading
            mode={mode}
          />
        )}
        Error={<Error />}
      >
        {({ data }) => <Content state={state} data={data} mode={mode} layout={layout} />}
      </ConditionalBlock>
    </SummaryCard>
  )
}
