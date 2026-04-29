import { type ReactNode, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type View as ViewType } from '@internal-types/general'
import { type ProfitAndLossCompareConfig } from '@internal-types/profitAndLoss'
import { translationKey } from '@utils/i18n/translationKey'
import { useElementViewSize } from '@hooks/utils/size/useElementViewSize'
import { type LinkingMetadata } from '@contexts/InAppLinkContext'
import { type ReportOption, ReportsHeaderContextProvider, type ReportType } from '@contexts/ReportsHeaderContext/ReportsHeaderContext'
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
import { ReportsToggle } from '@views/Reports/ReportsToggle'
import type { TimeRangePickerConfig } from '@views/Reports/reportTypes'

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

const REPORT_TYPE_CONFIG: { value: ReportType, i18nKey: string, defaultValue: string }[] = [
  { value: 'profitAndLoss', ...translationKey('common:label.profit_loss', 'Profit & Loss') },
  { value: 'balanceSheet', ...translationKey('reports:label.balance_sheet', 'Balance Sheet') },
  { value: 'statementOfCashFlow', ...translationKey('reports:label.statement_cash_flow', 'Statement of Cash Flow') },
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
  comparisonConfig,
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

  return (
    <ReportsHeaderContextProvider
      value={{
        enabledReports,
        options,
        activeReport: activeTab,
        selectedReportOption,
        setActiveReport: setActiveTab,
      }}
    >
      <View title={resolvedTitle} showHeader={showTitle}>
        {!isMobileView && <ReportsToggle />}
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
