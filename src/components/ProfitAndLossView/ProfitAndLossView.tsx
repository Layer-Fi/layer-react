import React, { RefObject, useContext, useRef } from 'react'
import { Container, Header } from '../Container'
import { DataState, DataStateStatus } from '../DataState'
import { Panel } from '../Panel'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { ProfitAndLossDetailedCharts } from '../ProfitAndLossDetailedCharts'
import { Heading } from '../Typography'

const COMPONENT_NAME = 'profit-and-loss'

export interface ProfitAndLossViewProps {
  hideTable?: boolean
  hideChart?: boolean
  showDetailedCharts?: boolean
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
  ...props
}: ProfitAndLossViewPanelProps) => {
  const { sidebarScope } = useContext(ProfitAndLoss.Context)

  return (
    <Panel
      sidebar={<ProfitAndLossDetailedCharts />}
      sidebarIsOpen={Boolean(sidebarScope)}
      parentRef={containerRef}
    >
      <Header className={`Layer__${COMPONENT_NAME}__header`}>
        <Heading className='Layer__profit-and-loss__title'>
          Profit & Loss
        </Heading>
      </Header>

      <Components {...props} />
    </Panel>
  )
}

const Components = ({
  hideChart = false,
  hideTable = false,
}: ProfitAndLossViewProps) => {
  const { error, isLoading, isValidating, refetch } = useContext(
    ProfitAndLoss.Context,
  )

  if (!isLoading && error) {
    return (
      <div className='Layer__table-state-container'>
        <DataState
          status={DataStateStatus.failed}
          title='Something went wrong'
          description='We couldn’t load your data.'
          onRefresh={() => refetch()}
          isLoading={isValidating}
        />
      </div>
    )
  }

  return (
    <>
      {!hideChart && (
        <div className={`Layer__${COMPONENT_NAME}__chart_with_summaries`}>
          <div
            className={`Layer__${COMPONENT_NAME}__chart_with_summaries__summary-col`}
          >
            <ProfitAndLoss.DatePicker />
            <ProfitAndLoss.Summaries vertical={true} actionable />
          </div>
          <div
            className={`Layer__${COMPONENT_NAME}__chart_with_summaries__chart-col`}
          >
            <ProfitAndLoss.Chart />
          </div>
        </div>
      )}
      {!hideTable && <ProfitAndLoss.Table />}
    </>
  )
}
