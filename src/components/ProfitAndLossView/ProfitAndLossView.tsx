import { type RefObject, useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { Container } from '@components/Container/Container'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { DataStateContainer } from '@components/DataStateContainer/DataStateContainer'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'
import { Panel } from '@components/Panel/Panel'
import { ProfitAndLoss } from '@components/ProfitAndLoss/ProfitAndLoss'
import { ProfitAndLossDetailedCharts } from '@components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { type ProfitAndLossDetailedChartsStringOverrides } from '@components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { ProfitAndLossHeader } from '@components/ProfitAndLossHeader/ProfitAndLossHeader'
import { type ProfitAndLossSummariesStringOverrides } from '@components/ProfitAndLossSummaries/ProfitAndLossSummaries'
import { type ProfitAndLossTableStringOverrides } from '@components/ProfitAndLossTable/ProfitAndLossTableComponent'
import { ProfitAndLossTableWithProvider } from '@components/ProfitAndLossTable/ProfitAndLossTableWithProvider'

import './profitAndLossView.scss'

const COMPONENT_NAME = 'profit-and-loss'

export interface ProfitAndLossViewProps {
  hideTable?: boolean
  hideChart?: boolean
  showDetailedCharts?: boolean
  stringOverrides?: {
    header?: string
    profitAndLossTable?: ProfitAndLossTableStringOverrides
    profitAndLossSummaries?: ProfitAndLossSummariesStringOverrides
    profitAndLossDetailedCharts?: ProfitAndLossDetailedChartsStringOverrides
  }
}

export interface ProfitAndLossViewPanelProps extends ProfitAndLossViewProps {
  containerRef: RefObject<HTMLDivElement>
}

export const ProfitAndLossView = (props: ProfitAndLossViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <Container name={COMPONENT_NAME} ref={containerRef}>
      <ProfitAndLoss>
        <ProfitAndLossPanel containerRef={containerRef} {...props} />
      </ProfitAndLoss>
    </Container>
  )
}

const ProfitAndLossPanel = ({
  containerRef,
  stringOverrides,
  ...props
}: ProfitAndLossViewPanelProps) => {
  const { sidebarScope } = useContext(ProfitAndLossContext)

  return (
    <Panel
      sidebar={(
        <ProfitAndLossDetailedCharts
          stringOverrides={stringOverrides?.profitAndLossDetailedCharts}
        />
      )}
      sidebarIsOpen={Boolean(sidebarScope)}
      parentRef={containerRef}
    >
      <ProfitAndLossHeader
        stringOverrides={{ title: stringOverrides?.header }}
        className={`Layer__${COMPONENT_NAME}__header`}
      />

      <Components stringOverrides={stringOverrides} {...props} />
    </Panel>
  )
}

const Components = ({
  hideChart = false,
  hideTable = false,
  stringOverrides,
}: ProfitAndLossViewProps) => {
  const { t } = useTranslation()
  const { isError, isLoading, isValidating, refetch } = useContext(ProfitAndLossContext)

  if (!isLoading && isError) {
    return (
      <DataStateContainer>
        <DataState
          status={DataStateStatus.failed}
          title={t('common:error.something_went_wrong', 'Something went wrong')}
          description={t('common:error.couldnt_load_data', 'We couldn’t load your data.')}
          onRefresh={() => refetch()}
          isLoading={isValidating}
        />
      </DataStateContainer>
    )
  }

  return (
    <>
      {!hideChart && (
        <div className={`Layer__${COMPONENT_NAME}__chart_with_summaries`}>
          <div
            className={`Layer__${COMPONENT_NAME}__chart_with_summaries__summary-col`}
          >
            <GlobalMonthPicker />
            <ProfitAndLoss.Summaries
              actionable
              stringOverrides={stringOverrides?.profitAndLossSummaries}
            />
          </div>
          <div
            className={`Layer__${COMPONENT_NAME}__chart_with_summaries__chart-col`}
          >
            <ProfitAndLoss.Chart />
          </div>
        </div>
      )}
      {!hideTable && (
        <ProfitAndLossTableWithProvider
          stringOverrides={stringOverrides?.profitAndLossTable}
        />
      )}
    </>
  )
}
