import { type ReactNode, useState } from 'react'

import { type View as ViewType } from '@internal-types/general'
import { type ProfitAndLossCompareConfig } from '@internal-types/profit_and_loss'
import { useElementViewSize } from '@hooks/useElementViewSize/useElementViewSize'
import { type LinkingMetadata } from '@contexts/InAppLinkContext'
import { Toggle } from '@ui/Toggle/Toggle'
import { BalanceSheet } from '@components/BalanceSheet/BalanceSheet'
import { type BalanceSheetStringOverrides } from '@components/BalanceSheet/BalanceSheet'
import { Container } from '@components/Container/Container'
import { ProfitAndLoss } from '@components/ProfitAndLoss/ProfitAndLoss'
import { type ProfitAndLossDetailedChartsStringOverrides } from '@components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { type ProfitAndLossDownloadButtonStringOverrides } from '@components/ProfitAndLossDownloadButton/types'
import { ProfitAndLossReport } from '@components/ProfitAndLossReport/ProfitAndLossReport'
import { type ProfitAndLossTableStringOverrides } from '@components/ProfitAndLossTable/ProfitAndLossTableComponent'
import { StatementOfCashFlow } from '@components/StatementOfCashFlow/StatementOfCashFlow'
import { type StatementOfCashFlowStringOverrides } from '@components/StatementOfCashFlow/StatementOfCashFlow'
import { View } from '@components/View/View'
import type { TimeRangePickerConfig } from '@views/Reports/reportTypes'

type ViewBreakpoint = ViewType | undefined

export interface ReportsStringOverrides {
  title?: string
  downloadButton?: ProfitAndLossDownloadButtonStringOverrides
  profitAndLoss?: {
    detailedCharts?: ProfitAndLossDetailedChartsStringOverrides
    table?: ProfitAndLossTableStringOverrides
  }
  balanceSheet?: BalanceSheetStringOverrides
  statementOfCashflow?: StatementOfCashFlowStringOverrides
}

export interface ReportsProps {
  title?: string // deprecated
  showTitle?: boolean
  stringOverrides?: ReportsStringOverrides
  enabledReports?: [ReportType, ...ReportType[]]
  comparisonConfig?: ProfitAndLossCompareConfig
  profitAndLossConfig?: TimeRangePickerConfig
  statementOfCashFlowConfig?: TimeRangePickerConfig
  renderInAppLink?: (source: LinkingMetadata) => ReactNode
}

type ReportType = 'profitAndLoss' | 'balanceSheet' | 'statementOfCashFlow'
type ReportOption = { value: ReportType, label: string }
export interface ReportsPanelProps {
  openReport: ReportType
  stringOverrides?: ReportsStringOverrides
  profitAndLossConfig?: TimeRangePickerConfig
  statementOfCashFlowConfig?: TimeRangePickerConfig
  view: ViewBreakpoint
  renderInAppLink?: (source: LinkingMetadata) => ReactNode
}

const getOptions = (enabledReports: ReportType[]) => {
  return [
    enabledReports.includes('profitAndLoss')
      ? {
        value: 'profitAndLoss',
        label: 'Profit & Loss',
      }
      : null,
    enabledReports.includes('balanceSheet')
      ? {
        value: 'balanceSheet',
        label: 'Balance Sheet',
      }
      : null,
    enabledReports.includes('statementOfCashFlow')
      ? {
        value: 'statementOfCashFlow',
        label: 'Statement of Cash Flow',
      }
      : null,
  ].filter(o => !!o) as ReportOption[]
}

export const Reports = ({
  title,
  showTitle = true,
  stringOverrides,
  enabledReports = ['profitAndLoss', 'balanceSheet', 'statementOfCashFlow'],
  comparisonConfig,
  profitAndLossConfig,
  statementOfCashFlowConfig,
  renderInAppLink,
}: ReportsProps) => {
  const [activeTab, setActiveTab] = useState<ReportType>(enabledReports[0])
  const { view, containerRef } = useElementViewSize<HTMLDivElement>()

  const options = getOptions(enabledReports)
  const defaultTitle =
    enabledReports.length > 1
      ? 'Reports'
      : options.find(option => (option.value === enabledReports[0]))?.label

  return (
    <View
      title={stringOverrides?.title || title || defaultTitle}
      showHeader={showTitle}
    >
      {enabledReports.length > 1 && (
        <div className='Layer__component Layer__header__actions'>
          <Toggle
            ariaLabel='Report type'
            options={options}
            selectedKey={activeTab}
            onSelectionChange={key => setActiveTab(key as ReportType)}
          />
        </div>
      )}
      <Container name='reports' ref={containerRef}>
        <ProfitAndLoss asContainer={false} comparisonConfig={comparisonConfig}>
          <ReportsPanel
            openReport={activeTab}
            stringOverrides={stringOverrides}
            profitAndLossConfig={profitAndLossConfig}
            statementOfCashFlowConfig={statementOfCashFlowConfig}
            view={view}
            renderInAppLink={renderInAppLink}
          />
        </ProfitAndLoss>
      </Container>
    </View>
  )
}

const ReportsPanel = ({
  openReport,
  stringOverrides,
  profitAndLossConfig,
  statementOfCashFlowConfig,
  view,
  renderInAppLink,
}: ReportsPanelProps) => {
  return (
    <>
      {openReport === 'profitAndLoss' && (
        <ProfitAndLossReport
          stringOverrides={stringOverrides}
          view={view}
          renderInAppLink={renderInAppLink}
          {...profitAndLossConfig}
        />
      )}
      {openReport === 'balanceSheet' && (
        <BalanceSheet stringOverrides={stringOverrides?.balanceSheet} />
      )}
      {openReport === 'statementOfCashFlow' && (
        <StatementOfCashFlow
          stringOverrides={stringOverrides?.statementOfCashflow}
          {...statementOfCashFlowConfig}
        />
      )}
    </>
  )
}
