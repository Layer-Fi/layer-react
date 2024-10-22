import React, { RefObject, useContext } from 'react'
import { View as ViewType } from '../../types/general'
import { ReportsStringOverrides } from '../../views/Reports/Reports'
import type { RangeReportConfig } from '../../views/Reports/reportTypes'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { Panel } from '../Panel'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { ProfitAndLossCompareOptionsProps } from '../ProfitAndLossCompareOptions'
import { View } from '../View'

type ViewBreakpoint = ViewType | undefined

export type ProfitAndLossReportProps = {
  stringOverrides?: ReportsStringOverrides
  comparisonConfig?: ProfitAndLossCompareOptionsProps
  parentRef?: RefObject<HTMLDivElement>
  view?: ViewBreakpoint
} & RangeReportConfig

export const ProfitAndLossReport = ({
  stringOverrides,
  comparisonConfig,
  allowedDatePickerModes,
  datePickerMode,
  defaultDatePickerMode,
  customDateRanges,
  csvMoneyFormat,
  parentRef,
  view,
}: ProfitAndLossReportProps) => {
  const { sidebarScope } = useContext(ProfitAndLoss.Context)

  return (
    <View
      type='panel'
      header={
        <Header>
          <HeaderRow>
            <HeaderCol>
              <>
                <ProfitAndLoss.DatePicker
                  allowedDatePickerModes={allowedDatePickerModes}
                  datePickerMode={datePickerMode}
                  defaultDatePickerMode={defaultDatePickerMode}
                  customDateRanges={customDateRanges}
                />
                {comparisonConfig && view === 'desktop' ? (
                  <ProfitAndLoss.CompareOptions
                    tagComparisonOptions={comparisonConfig.tagComparisonOptions}
                    defaultTagFilter={comparisonConfig.defaultTagFilter}
                  />
                ) : null}
              </>
            </HeaderCol>
            <HeaderCol>
              <ProfitAndLoss.DownloadButton
                stringOverrides={stringOverrides?.downloadButton}
                useComparisonPnl={!!comparisonConfig}
                moneyFormat={csvMoneyFormat}
                view={view}
              />
            </HeaderCol>
          </HeaderRow>
          {comparisonConfig && view !== 'desktop' ? (
            <HeaderRow>
              <HeaderCol>
                <ProfitAndLoss.CompareOptions
                  tagComparisonOptions={comparisonConfig.tagComparisonOptions}
                  defaultTagFilter={comparisonConfig.defaultTagFilter}
                />
              </HeaderCol>
            </HeaderRow>
          ) : null}
        </Header>
      }
    >
      <Panel
        sidebar={
          <ProfitAndLoss.DetailedCharts
            showDatePicker={false}
            stringOverrides={stringOverrides?.profitAndLoss?.detailedCharts}
          />
        }
        sidebarIsOpen={Boolean(sidebarScope)}
        parentRef={parentRef}
      >
        <ProfitAndLoss.Table
          asContainer={false}
          stringOverrides={stringOverrides?.profitAndLoss?.table}
        />
      </Panel>
    </View>
  )
}
