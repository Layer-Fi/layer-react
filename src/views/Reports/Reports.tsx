import { ReactNode, useState } from 'react'
import { BalanceSheet as EmbeddedBalanceSheet } from '../../components/BalanceSheet'
import { BalanceSheetStringOverrides } from '../../components/BalanceSheet/BalanceSheet'
import { Container } from '../../components/Container'
import { ProfitAndLoss } from '../../components/ProfitAndLoss/ProfitAndLoss'
import { ProfitAndLossDetailedChartsStringOverrides } from '../../components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { ProfitAndLossDownloadButtonStringOverrides } from '../../components/ProfitAndLossDownloadButton/types'
import { ProfitAndLossTableStringOverrides } from '../../components/ProfitAndLossTable'
import { StatementOfCashFlow as EmbeddedStatementOfCashFlow } from '../../components/StatementOfCashFlow'
import { StatementOfCashFlowStringOverrides } from '../../components/StatementOfCashFlow/StatementOfCashFlow'
import { Toggle } from '../../components/Toggle'
import { View } from '../../components/View'
import { useElementViewSize } from '../../hooks/useElementViewSize/useElementViewSize'
import { View as ViewType } from '../../types/general'
import type { TimeRangePickerConfig } from './reportTypes'
import { ProfitAndLossCompareConfig } from '../../types/profit_and_loss'
import { ReportKey, ReportsModeStoreProvider, type ReportModes } from '../../providers/ReportsModeStoreProvider/ReportsModeStoreProvider'
import { getInitialDateRangePickerMode } from '../../providers/GlobalDateStore/useGlobalDateRangePicker'
import { ProfitAndLossReport as EmbeddedProfitAndLossReport } from '../../components/ProfitAndLossReport/ProfitAndLossReport'
import { LinkingMetadata } from '../../contexts/InAppLinkContext'

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
  enabledReports?: ReportType[]
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

  const initialModeForProfitAndLoss = profitAndLossConfig ? getInitialDateRangePickerMode(profitAndLossConfig) : 'monthPicker'
  const initialModeForStatementOfCashFlows = statementOfCashFlowConfig ? getInitialDateRangePickerMode(statementOfCashFlowConfig) : 'monthPicker'

  const initialModes: ReportModes = {
    [ReportKey.ProfitAndLoss]: initialModeForProfitAndLoss,
    [ReportKey.BalanceSheet]: 'dayPicker',
    [ReportKey.StatementOfCashFlows]: initialModeForStatementOfCashFlows,
  }

  return (
    <View
      title={stringOverrides?.title || title || defaultTitle}
      showHeader={showTitle}
    >
      {enabledReports.length > 1 && (
        <div className='Layer__component Layer__header__actions'>
          <Toggle
            name='reports-tabs'
            options={options}
            selected={activeTab}
            onChange={opt => setActiveTab(opt.target.value as ReportType)}
          />
        </div>
      )}
      <Container name='reports' ref={containerRef}>
        <ReportsModeStoreProvider initialModes={initialModes} resetPnLModeToDefaultOnMount={false}>
          <ProfitAndLoss asContainer={false} comparisonConfig={comparisonConfig} withReportsModeProvider={false}>
            <ReportsPanel
              openReport={activeTab}
              stringOverrides={stringOverrides}
              profitAndLossConfig={profitAndLossConfig}
              statementOfCashFlowConfig={statementOfCashFlowConfig}
              view={view}
              renderInAppLink={renderInAppLink}
            />
          </ProfitAndLoss>
        </ReportsModeStoreProvider>
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
        <EmbeddedProfitAndLossReport
          stringOverrides={stringOverrides}
          view={view}
          renderInAppLink={renderInAppLink}
          {...profitAndLossConfig}
        />
      )}
      {openReport === 'balanceSheet' && (
        <EmbeddedBalanceSheet stringOverrides={stringOverrides?.balanceSheet} />
      )}
      {openReport === 'statementOfCashFlow' && (
        <EmbeddedStatementOfCashFlow
          stringOverrides={stringOverrides?.statementOfCashflow}
          {...statementOfCashFlowConfig}
        />
      )}
    </>
  )
}
