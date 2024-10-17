import React, { RefObject, useContext } from 'react'
import { MoneyFormat } from '../../types'
import { View as ViewType } from '../../types/general'
import { ReportsStringOverrides } from '../../views/Reports/Reports'
import { DateRangeDatePickerModes } from '../DatePicker/DatePicker'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { Panel } from '../Panel'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { ProfitAndLossCompareOptionsProps } from '../ProfitAndLossCompareOptions'
import { View } from '../View'

type ViewBreakpoint = ViewType | undefined

export interface ProfitAndLossReportProps {
  stringOverrides?: ReportsStringOverrides
  comparisonConfig?: ProfitAndLossCompareOptionsProps
  datePickerMode?: DateRangeDatePickerModes
  csvMoneyFormat?: MoneyFormat
  parentRef?: RefObject<HTMLDivElement>
  view?: ViewBreakpoint
}

export const ProfitAndLossReport = ({
  stringOverrides,
  comparisonConfig,
  datePickerMode,
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
                <ProfitAndLoss.DatePicker datePickerMode={datePickerMode} />
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
