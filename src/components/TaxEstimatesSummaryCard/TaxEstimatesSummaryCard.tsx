import classNames from 'classnames'

import { DateFormat } from '@utils/i18n/date/patterns'
import { SummaryCard } from '@ui/SummaryCard/SummaryCard'
import { type SummaryCardInteractionProps, type SummaryCardStringOverrides, useSummaryCardSlots } from '@ui/SummaryCard/useSummaryCardSlots'
import { TaxEstimatesSummaryCardMode } from '@components/TaxEstimatesSummaryCard/constants'
import { TaxEstimatesSummaryCardError as Error } from '@components/TaxEstimatesSummaryCard/states/TaxEstimatesSummaryCardError'
import { TaxEstimatesSummaryCardLoading as Loading } from '@components/TaxEstimatesSummaryCard/states/TaxEstimatesSummaryCardLoading'
import { Content } from '@components/TaxEstimatesSummaryCard/TaxEstimatesSummaryCardContent'
import { useTaxEstimatesSummaryCard } from '@components/TaxEstimatesSummaryCard/useTaxEstimatesSummaryCard'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

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
