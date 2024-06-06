import React, { RefObject, useContext, useRef } from 'react'
import { Button, ButtonVariant } from '../../components/Button'
import { Container } from '../../components/Container'
import { Panel } from '../../components/Panel'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
import { Toggle } from '../../components/Toggle'
import { View } from '../../components/View'
import { useLayerContext } from '../../hooks/useLayerContext'
import DownloadCloud from '../../icons/DownloadCloud'

export interface ReportsProps {
  title?: string
}

export interface ReportsPanelProps {
  containerRef: RefObject<HTMLDivElement>
}

const DownloadButton = () => {
  const { dateRange } = useContext(ProfitAndLoss.Context)
  const { auth, businessId, apiUrl } = useLayerContext()
  return (
    <Button
      variant={ButtonVariant.secondary}
      rightIcon={<DownloadCloud size={12} />}
      onClick={async () => {
        const month = (dateRange.startDate.getMonth() + 1).toString()
        const year = dateRange.startDate.getFullYear().toString()
        const createResponse = await fetch(
          `${apiUrl}/v1/businesses/${businessId}/reports/profit-and-loss/exports/csv?month=${month}&year=${year}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${auth?.access_token}`,
            },
          },
        )
        const body = await createResponse.json()
        window.location.href = body.data.presignedUrl
      }}
    >
      Download
    </Button>
  )
}

export const Reports = ({ title = 'Reports' }: ReportsProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <ProfitAndLoss asContainer={false}>
      <View title={title} headerControls={<ProfitAndLoss.DatePicker />}>
        <div className='Layer__header__actions'>
          <Toggle
            name='reports-tabs'
            options={[
              { value: 'profitAndLoss', label: 'Profit & loss' },
              { value: 'balanceSheet', label: 'Balance sheet', disabled: true },
            ]}
            selected='profitAndLoss'
            onChange={() => null}
          />
          <DownloadButton />
        </div>
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
