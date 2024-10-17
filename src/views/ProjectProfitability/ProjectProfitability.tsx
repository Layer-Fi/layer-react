import React, { useState } from 'react'
import { BankTransactions } from '../../components/BankTransactions'
import { Container } from '../../components/Container'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
import { ProjectSelector } from '../../components/ProjectProfitability/ProjectSelector'
import { Toggle } from '../../components/Toggle'
import { View } from '../../components/View'
import { TagsStoreProvider } from '../../contexts/Tags/TagsStoreProvider'
import { useTags } from '../../hooks/tags/useTags'
import { useElementViewSize } from '../../hooks/useElementViewSize'
import { DisplayState } from '../../types'
import { View as ViewType } from '../../types/general'
import type { ReportsStringOverrides } from '../Reports/Reports'
import classNames from 'classnames'

function BankTransactionsWithProjectFilters() {
  const { tag, category } = useTags()
  const tagFilter =
    tag && category
      ? { tagKey: tag.value, tagValues: [category.value] }
      : 'None'

  return (
    <BankTransactions
      hideHeader={true}
      filters={{
        categorizationStatus: DisplayState.all,
        tagFilter,
      }}
    />
  )
}

function ProfitAndLossWithProjectFilters({
  activeTab,
  stringOverrides,
}: {
  activeTab: ProjectTab
  stringOverrides?: ReportsStringOverrides
}) {
  const [view, setView] = useState<ViewBreakpoint>('desktop')
  const [pnlToggle, setPnlToggle] = useState<PnlToggleOption>('expenses')
  const containerRef = useElementViewSize<HTMLDivElement>(newView =>
    setView(newView),
  )

  const { tag, category } = useTags()
  const tagFilter =
    tag && category ? { key: tag.value, values: [category.value] } : undefined

  const profitAndLossConfig = {
    datePickerMode: 'monthPicker',
    csvMoneyFormat: 'DOLLAR_STRING',
  } as const

  return (
    <ProfitAndLoss asContainer={false} tagFilter={tagFilter}>
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
                onChange={e => setPnlToggle(e.target.value as PnlToggleOption)}
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
            <BankTransactionsWithProjectFilters />
          )}
          {activeTab === 'report' && (
            <ProfitAndLoss.Report
              stringOverrides={stringOverrides}
              datePickerMode={profitAndLossConfig.datePickerMode}
              csvMoneyFormat={profitAndLossConfig.csvMoneyFormat}
              parentRef={containerRef}
              view={view}
            />
          )}
        </>
      </Container>
    </ProfitAndLoss>
  )
}

type ViewBreakpoint = ViewType | undefined
type PnlToggleOption = 'revenue' | 'expenses'

export interface ProjectsStringOverrides {
  title?: string
}

export interface ProjectProfitabilityProps {
  showTitle?: boolean
  stringOverrides?: ProjectsStringOverrides
}

type ProjectTab = 'overview' | 'transactions' | 'report'

export const ProjectProfitabilityView = ({
  showTitle,
  stringOverrides,
}: ProjectProfitabilityProps) => {
  return (
    <View title={stringOverrides?.title || ''} showHeader={showTitle}>
      <ProfitAndLoss asContainer={false}>
        <ProjectProfitability
          showTitle={showTitle}
          stringOverrides={stringOverrides}
        />
      </ProfitAndLoss>
    </View>
  )
}

const ProjectProfitability = ({
  showTitle,
  stringOverrides,
}: ProjectProfitabilityProps) => {
  const [activeTab, setActiveTab] = useState<ProjectTab>('overview')

  return (
    <TagsStoreProvider initialActiveKey='project'>
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
        <ProfitAndLossWithProjectFilters activeTab={activeTab} />
      </View>
    </TagsStoreProvider>
  )
}
