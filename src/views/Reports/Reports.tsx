import React, { RefObject, useContext, useRef, useState } from 'react'
import { Layer } from '../../api/layer'
import { BalanceSheet } from '../../components/BalanceSheet'
import { Button, ButtonVariant, RetryButton } from '../../components/Button'
import { Container } from '../../components/Container'
import { Panel } from '../../components/Panel'
import { PanelView } from '../../components/PanelView'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
import { Toggle } from '../../components/Toggle'
import { View } from '../../components/View'
import { useLayerContext } from '../../contexts/LayerContext'
import DownloadCloud from '../../icons/DownloadCloud'
import { startOfDay } from 'date-fns'

export interface ReportsProps {
  title?: string
}

type ReportType = 'profitAndLoss' | 'balanceSheet'
type ReportOption = { value: ReportType; label: string }
export interface ReportsPanelProps {
  containerRef: RefObject<HTMLDivElement>
  openReport: ReportType
}

const DownloadButton = () => {
  const { dateRange } = useContext(ProfitAndLoss.Context)
  const { auth, businessId, apiUrl } = useLayerContext()
  const [requestFailed, setRequestFailed] = useState(false)

  const handleClick = async () => {
    const month = (dateRange.startDate.getMonth() + 1).toString()
    const year = dateRange.startDate.getFullYear().toString()
    const getProfitAndLossCsv = Layer.getProfitAndLossCsv(
      apiUrl,
      auth.access_token,
      {
        params: {
          businessId: businessId,
          year: year,
          month: month,
        },
      },
    )
    try {
      const result = await getProfitAndLossCsv()
      if (result?.data?.presignedUrl) {
        window.location.href = result.data.presignedUrl
        setRequestFailed(false)
      } else {
        setRequestFailed(true)
      }
    } catch (e) {
      setRequestFailed(true)
    }
  }

  return requestFailed ? (
    <RetryButton
      onClick={handleClick}
      className='Layer__download-retry-btn'
      error={'Approval failed. Check connection and retry in few seconds.'}
    >
      Retry
    </RetryButton>
  ) : (
    <Button
      variant={ButtonVariant.secondary}
      rightIcon={<DownloadCloud size={12} />}
      onClick={handleClick}
    >
      Download
    </Button>
  )
}

export const Reports = ({ title = 'Reports' }: ReportsProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<ReportType>('profitAndLoss')

  return (
    <View title={'Reports'}>
      <div className='Layer__component Layer__header__actions'>
        <Toggle
          name='reports-tabs'
          options={
            [
              { value: 'profitAndLoss', label: 'Profit & Loss' },
              { value: 'balanceSheet', label: 'Balance Sheet' },
            ] as ReportOption[]
          }
          selected={activeTab}
          onChange={opt => setActiveTab(opt.target.value as ReportType)}
        />
        <DownloadButton />
      </div>
      <Container name='reports' ref={containerRef}>
        <ReportsPanel containerRef={containerRef} openReport={activeTab} />
      </Container>
    </View>
  )
}

const ReportsPanel = ({ containerRef, openReport }: ReportsPanelProps) => {
  const { sidebarScope } = useContext(ProfitAndLoss.Context)

  return (
    <Panel
      sidebar={<ProfitAndLoss.DetailedCharts />}
      sidebarIsOpen={Boolean(sidebarScope)}
      parentRef={containerRef}
    >
      {openReport === 'profitAndLoss' ? (
        <ProfitAndLoss asContainer={false}>
          <PanelView
            title={'Profit & Loss'}
            headerControls={<ProfitAndLoss.DatePicker />}
          >
            <ProfitAndLoss.Table asContainer={false} />
          </PanelView>
        </ProfitAndLoss>
      ) : (
        <BalanceSheet effectiveDate={startOfDay(new Date())}>
          <BalanceSheet.View />
        </BalanceSheet>
      )}
    </Panel>
  )
}
