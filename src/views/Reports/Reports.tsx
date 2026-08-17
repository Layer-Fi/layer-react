import { type ReactNode, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { TimeRangePickerConfig } from '@internal-types/features/reports/timeRangePickerConfig'
import { type View as ViewType } from '@internal-types/shared/view'
import { translationKey } from '@utils/shared/i18n/translationKey'
import { type LinkingMetadata } from '@providers/common/InAppLink/InAppLinkContext'
import { useElementViewSize } from '@hooks/utils/size/useElementViewSize'
import { type ReportOption, ReportsHeaderContextProvider, type ReportType } from '@providers/features/reports/ReportsHeaderContext/ReportsHeaderContext'
import { Container } from '@blocks/Layout/Container/Container'
import { View } from '@blocks/Layout/View/View'
import { BalanceSheet } from '@features/balanceSheet/BalanceSheet/BalanceSheet'
import { type BalanceSheetStringOverrides } from '@features/balanceSheet/BalanceSheet/BalanceSheet'
import { StatementOfCashFlow } from '@features/cashflowStatement/StatementOfCashFlow/StatementOfCashFlow'
import { type StatementOfCashFlowStringOverrides } from '@features/cashflowStatement/StatementOfCashFlow/StatementOfCashFlow'
import { ProfitAndLoss } from '@features/profitAndLoss/ProfitAndLoss/ProfitAndLoss'
import { type ProfitAndLossDetailedChartsStringOverrides } from '@features/profitAndLoss/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { type ProfitAndLossDownloadButtonStringOverrides } from '@features/profitAndLoss/ProfitAndLossDownloadButton/types'
import { ProfitAndLossReport } from '@features/profitAndLoss/ProfitAndLossReport/ProfitAndLossReport'
import { type ProfitAndLossTableStringOverrides } from '@features/profitAndLoss/ProfitAndLossTable/ProfitAndLossTableComponent'
import { ReportsToggle } from '@views/Reports/ReportsToggle'

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
  { value: 'balanceSheet', ...translationKey('views:Reports.label.balance_sheet', 'Balance Sheet') },
  { value: 'statementOfCashFlow', ...translationKey('views:Reports.label.cash_flow_statement', 'Cash Flow Statement') },
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
      ? t('views:Reports.label.reports', 'Reports')
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
        <Container className='Layer__reports' overflow='hidden' ref={containerRef}>
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
