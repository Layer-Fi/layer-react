import { type ReactNode, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type View as ViewType } from '@internal-types/general'
import type { TimeRangePickerConfig } from '@internal-types/reports'
import { translationKey } from '@utils/i18n/translationKey'
import { useElementViewSize } from '@hooks/utils/size/useElementViewSize'
import { type LinkingMetadata } from '@contexts/InAppLinkContext'
import { type ReportOption, ReportsHeaderContextProvider, type ReportType } from '@contexts/ReportsHeaderContext/ReportsHeaderContext'
import { Container } from '@components/Container/Container'
import { View } from '@components/View/View'
import { ProfitAndLoss } from '@features/profitAndLoss/ProfitAndLoss/ProfitAndLoss'
import { type ProfitAndLossDetailedChartsStringOverrides } from '@features/profitAndLoss/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { type ProfitAndLossDownloadButtonStringOverrides } from '@features/profitAndLoss/ProfitAndLossDownloadButton/types'
import { ProfitAndLossReport } from '@features/profitAndLoss/ProfitAndLossReport/ProfitAndLossReport'
import { type ProfitAndLossTableStringOverrides } from '@features/profitAndLoss/ProfitAndLossTable/ProfitAndLossTableComponent'
import { BalanceSheet } from '@features/reports/BalanceSheet/BalanceSheet'
import { type BalanceSheetStringOverrides } from '@features/reports/BalanceSheet/BalanceSheet'
import { StatementOfCashFlow } from '@features/reports/StatementOfCashFlow/StatementOfCashFlow'
import { type StatementOfCashFlowStringOverrides } from '@features/reports/StatementOfCashFlow/StatementOfCashFlow'
import { ReportsToggle } from '@views/Reports/ReportsToggle'

import './reports.scss'

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
  /**
   * @deprecated The Profit & Loss comparison feature has been removed and this prop is ignored.
   * Use the `UnifiedReports` component for period/tag comparisons instead.
   */
  comparisonConfig?: unknown
  profitAndLossConfig?: TimeRangePickerConfig
  statementOfCashFlowConfig?: TimeRangePickerConfig
  renderInAppLink?: (source: LinkingMetadata) => ReactNode
}

const REPORT_TYPE_CONFIG: { value: ReportType, i18nKey: string, defaultValue: string }[] = [
  { value: 'profitAndLoss', ...translationKey('common:label.profit_loss', 'Profit & Loss') },
  { value: 'balanceSheet', ...translationKey('reports:label.balance_sheet', 'Balance Sheet') },
  { value: 'statementOfCashFlow', ...translationKey('reports:label.cash_flow_statement', 'Cash Flow Statement') },
]

export interface ReportsPanelProps {
  openReport: ReportType
  stringOverrides?: ReportsStringOverrides
  profitAndLossConfig?: TimeRangePickerConfig
  statementOfCashFlowConfig?: TimeRangePickerConfig
  view: ViewType | undefined
  renderInAppLink?: (source: LinkingMetadata) => ReactNode
}

const defaultEnabledReports: ReportType[] = ['profitAndLoss', 'balanceSheet', 'statementOfCashFlow']
export const Reports = ({
  title,
  showTitle = true,
  stringOverrides,
  enabledReports = defaultEnabledReports,
  profitAndLossConfig,
  statementOfCashFlowConfig,
  renderInAppLink,
}: ReportsProps) => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<ReportType>(enabledReports[0])
  const { view, containerRef } = useElementViewSize<HTMLDivElement>()
  const isMobileView = view === 'mobile'

  const options = useMemo<ReportOption[]>(
    () => REPORT_TYPE_CONFIG
      .filter(c => enabledReports.includes(c.value))
      .map(c => ({ value: c.value, label: t(c.i18nKey, c.defaultValue) })),
    [enabledReports, t],
  )
  const selectedReportOption = useMemo(
    () => options.find(option => option.value === activeTab) ?? null,
    [activeTab, options],
  )
  const defaultTitle =
    enabledReports.length > 1
      ? t('reports:label.reports', 'Reports')
      : options.find(option => (option.value === enabledReports[0]))?.label

  const resolvedTitle = stringOverrides?.title || title || defaultTitle

  const reportsHeaderContextValue = useMemo(
    () => ({
      enabledReports,
      options,
      activeReport: activeTab,
      selectedReportOption,
      setActiveReport: setActiveTab,
    }),
    [enabledReports, options, activeTab, selectedReportOption],
  )

  return (
    <ReportsHeaderContextProvider value={reportsHeaderContextValue}>
      <View title={resolvedTitle} showHeader={showTitle}>
        {!isMobileView && <ReportsToggle />}
        <Container name='reports' ref={containerRef}>
          <ProfitAndLoss asContainer={false}>
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
    </ReportsHeaderContextProvider>
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
        <BalanceSheet
          stringOverrides={stringOverrides?.balanceSheet}
          view={view}
        />
      )}
      {openReport === 'statementOfCashFlow' && (
        <StatementOfCashFlow
          stringOverrides={stringOverrides?.statementOfCashflow}
          view={view}
          {...statementOfCashFlowConfig}
        />
      )}
    </>
  )
}
