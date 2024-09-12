import React, { RefObject, useRef, useState } from 'react'
import { BalanceSheet } from '../../components/BalanceSheet'
import { BalanceSheetStringOverrides } from '../../components/BalanceSheet/BalanceSheet'
import { Container } from '../../components/Container'
import { DateRangeDatePickerModes } from '../../components/DatePicker/DatePicker'
import { Button, ButtonVariant, RetryButton } from '../../components/Button'
import { DownloadButton as DownloadButtonComponent } from '../../components/Button'
import { Container } from '../../components/Container'
import { DateRangeDatePickerModes } from '../../components/DatePicker/DatePicker'
import { Header, HeaderCol, HeaderRow } from '../../components/Header'
import { Panel } from '../../components/Panel'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
import { ProfitAndLossCompareOptionsProps } from '../../components/ProfitAndLossCompareOptions/ProfitAndLossCompareOptions'
import { ProfitAndLossDetailedChartsStringOverrides } from '../../components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { ProfitAndLossTableStringOverrides } from '../../components/ProfitAndLossTable'
import { StatementOfCashFlow } from '../../components/StatementOfCashFlow'
import { StatementOfCashFlowStringOverrides } from '../../components/StatementOfCashFlow/StatementOfCashFlow'
import { Toggle } from '../../components/Toggle'
import { View } from '../../components/View'
import { DownloadButtonStringOverrides } from '../../components/ProfitAndLossReport/ProfitAndLossReport'
import { BREAKPOINTS } from '../../config/general'
import { useLayerContext } from '../../contexts/LayerContext'
import { useElementSize } from '../../hooks/useElementSize'
import { useElementViewSize } from '../../hooks/useElementViewSize'
import { MoneyFormat } from '../../types'
import { View as ViewType } from '../../types/general'

type ViewBreakpoint = ViewType | undefined

export interface ReportsStringOverrides {
  title?: string
  downloadButton?: DownloadButtonStringOverrides
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
  comparisonConfig?: ProfitAndLossCompareOptionsProps
  profitAndLossConfig?: {
    datePickerMode?: DateRangeDatePickerModes
    csvMoneyFormat?: MoneyFormat
  }
  statementOfCashFlowConfig?: {
    datePickerMode?: DateRangeDatePickerModes
  }
}

type ReportType = 'profitAndLoss' | 'balanceSheet' | 'statementOfCashFlow'
type ReportOption = { value: ReportType; label: string }
export interface ReportsPanelProps {
  containerRef: RefObject<HTMLDivElement>
  openReport: ReportType
  stringOverrides?: ReportsStringOverrides
  comparisonConfig?: ProfitAndLossCompareOptionsProps
  profitAndLossConfig?: {
    datePickerMode?: DateRangeDatePickerModes
    csvMoneyFormat?: MoneyFormat
  }
  statementOfCashFlowConfig?: {
    datePickerMode?: DateRangeDatePickerModes
  }
  view: ViewBreakpoint
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
}: ReportsProps) => {
  const [activeTab, setActiveTab] = useState<ReportType>(enabledReports[0])
  const [view, setView] = useState<ViewBreakpoint>('desktop')

  const containerRef = useElementViewSize<HTMLDivElement>(newView =>
    setView(newView),
  )

  const options = getOptions(enabledReports)
  const defaultTitle =
    enabledReports.length > 1
      ? 'Reports'
      : options.find(option => (option.value = enabledReports[0]))?.label

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
        <ProfitAndLoss asContainer={false}>
          <ReportsPanel
            containerRef={containerRef}
            openReport={activeTab}
            stringOverrides={stringOverrides}
            comparisonConfig={comparisonConfig}
            profitAndLossConfig={profitAndLossConfig}
            statementOfCashFlowConfig={statementOfCashFlowConfig}
            view={view}
          />
        </ProfitAndLoss>
      </Container>
    </View>
  )
}

const ReportsPanel = ({
  containerRef,
  openReport,
  stringOverrides,
  comparisonConfig,
  profitAndLossConfig,
  statementOfCashFlowConfig,
  view,
}: ReportsPanelProps) => {
  return (
    <>
      {openReport === 'profitAndLoss' && (
        <ProfitAndLoss.Report
          stringOverrides={stringOverrides}
          comparisonConfig={comparisonConfig}
          datePickerMode={profitAndLossConfig?.datePickerMode}
          csvMoneyFormat={profitAndLossConfig?.csvMoneyFormat}
          parentRef={containerRef}
        />
      )}
      {openReport === 'balanceSheet' && (
        <BalanceSheet stringOverrides={stringOverrides?.balanceSheet} />
      )}
      {openReport === 'statementOfCashFlow' && (
        <StatementOfCashFlow
          stringOverrides={stringOverrides?.statementOfCashflow}
          datePickerMode={statementOfCashFlowConfig?.datePickerMode}
        />
      )}
    </>
  )
}
