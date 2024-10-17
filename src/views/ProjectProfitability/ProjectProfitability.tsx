import React, { useState } from 'react'
import { BankTransactions } from '../../components/BankTransactions'
import { Container } from '../../components/Container'
import { DateRangeDatePickerModes } from '../../components/DatePicker/DatePicker'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
import { ProjectSelector } from '../../components/ProjectProfitability/ProjectSelector'
import { Toggle } from '../../components/Toggle'
import { View } from '../../components/View'
import { useElementViewSize } from '../../hooks/useElementViewSize'
import { useTags } from '../../hooks/useProjects'
import { DisplayState, MoneyFormat } from '../../types'
import { View as ViewType } from '../../types/general'
import classNames from 'classnames'

type ViewBreakpoint = ViewType | undefined
type PnlToggleOption = 'revenue' | 'expenses'

export interface ProjectsStringOverrides {
  title?: string
}

export interface ProjectProfitabilityProps {
  showTitle?: boolean
  stringOverrides?: ProjectsStringOverrides
}

export const ProjectProfitabilityView = ({
  showTitle,
  stringOverrides,
}: ProjectProfitabilityProps) => {
  const [activeTab, setActiveTab] = useState<ProjectTab>('overview')
  const [view, setView] = useState<ViewBreakpoint>('desktop')
  const [pnlToggle, setPnlToggle] = useState<PnlToggleOption>('expenses')
  const containerRef = useElementViewSize<HTMLDivElement>(newView =>
    setView(newView),
  )
  const tags = useTags()
  console.log('in component', tags.activeValue)

  type ProjectTab = 'overview' | 'transactions' | 'report'

  const comparisonConfig = undefined
  const profitAndLossConfig: {
    datePickerMode?: DateRangeDatePickerModes
    csvMoneyFormat?: MoneyFormat
  } = {
    datePickerMode: 'monthPicker',
    csvMoneyFormat: 'DOLLAR_STRING',
  }

  return (
    <View title={stringOverrides?.title || ''} showHeader={showTitle}>
      <ProjectSelector />
      <div className='Layer__component Layer__header__actions'>
        <Toggle
          name='project-tabs'
          options={[
            {
              value: 'overview',
              label: 'Overview',
            },
            {
              value: 'transactions',
              label: 'Transactions',
            },
            {
              value: 'report',
              label: 'Report',
            },
          ]}
          selected={activeTab}
          onChange={opt => setActiveTab(opt.target.value as ProjectTab)}
        />
      </div>
      <ProfitAndLoss asContainer={false}>
        <Container name='project' ref={containerRef}>
          <>
            {activeTab === 'overview' && (
              <div className='Layer__accounting-overview-profit-and-loss-charts'>
                <Toggle
                  name='pnl-detailed-charts'
                  options={[
                    {
                      value: 'revenue',
                      label: 'Revenue',
                    },
                    {
                      value: 'expenses',
                      label: 'Expenses',
                    },
                  ]}
                  selected={pnlToggle}
                  onChange={e =>
                    setPnlToggle(e.target.value as PnlToggleOption)
                  }
                />
                <Container
                  name={classNames(
                    'accounting-overview-profit-and-loss-chart',
                    pnlToggle !== 'revenue' &&
                      'accounting-overview-profit-and-loss-chart--hidden',
                  )}
                >
                  <ProfitAndLoss.DetailedCharts
                    scope='revenue'
                    hideClose={true}
                    // stringOverrides={stringOverrides?.profitAndLoss?.detailedCharts}
                    // chartColorsList={chartColorsList}
                  />
                </Container>
                <Container
                  name={classNames(
                    'accounting-overview-profit-and-loss-chart',
                    pnlToggle !== 'expenses' &&
                      'accounting-overview-profit-and-loss-chart--hidden',
                  )}
                >
                  <ProfitAndLoss.DetailedCharts
                    scope='expenses'
                    hideClose={true}
                    // stringOverrides={stringOverrides?.profitAndLoss?.detailedCharts}
                    // chartColorsList={chartColorsList}
                  />
                </Container>
              </div>
            )}
            {activeTab === 'transactions' && (
              <BankTransactions
                hideHeader={true}
                filters={{
                  categorizationStatus: DisplayState.all,
                  // tagFilter: {
                  //   tagKey: 'project',
                  //   tagValues: ['project1', 'project2'],
                  // },
                }}
              />
            )}
            {activeTab === 'report' && (
              <ProfitAndLoss.Report
                stringOverrides={stringOverrides}
                comparisonConfig={comparisonConfig}
                datePickerMode={profitAndLossConfig?.datePickerMode}
                csvMoneyFormat={profitAndLossConfig?.csvMoneyFormat}
                parentRef={containerRef}
                view={view}
              />
            )}
          </>
        </Container>
      </ProfitAndLoss>
    </View>
  )
}
