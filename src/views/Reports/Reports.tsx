import React, { RefObject, useContext, useRef } from 'react'
import { Container } from '../../components/Container'
import { Panel } from '../../components/Panel'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
import { Toggle } from '../../components/Toggle'
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
        <Toggle
          name='reports-tabs'
          options={[
            {
              value: 'profitAndLoss',
              label: 'Profit & loss',
            },
            {
              value: 'balanceSheet',
              label: 'Balance sheet',
              disabled: true,
            },
          ]}
          selected='profitAndLoss'
          onChange={() => null}
        />
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
