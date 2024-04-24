import React, { RefObject, useContext, useRef } from 'react'
import { Container } from '../../components/Container'
import { Panel } from '../../components/Panel'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
import { View } from '../../components/View'

export interface ReportsProps {
  title?: string
}

export interface ReportsPanelProps {
  containerRef: RefObject<HTMLDivElement>
}

export const Reports = ({ title = 'Reports' }: ReportsProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <ProfitAndLoss asContainer={false}>
      <View title={title} headerControls={<ProfitAndLoss.DatePicker />}>
        <Container name='reports' ref={containerRef}>
          <ReportsPanel containerRef={containerRef} />
        </Container>
      </View>
    </ProfitAndLoss>
  )
}

const ReportsPanel = ({ containerRef }: ReportsPanelProps) => {
  const { sidebarScope } = useContext(ProfitAndLoss.Context)

  return (
    <Panel
      sidebar={<ProfitAndLoss.DetailedCharts />}
      sidebarIsOpen={Boolean(sidebarScope)}
      parentRef={containerRef}
    >
      <ProfitAndLoss.Table asContainer={false} />
    </Panel>
  )
}
