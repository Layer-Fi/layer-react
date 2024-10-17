import React, { useContext, useEffect, useState } from 'react'
import Select, { Options } from 'react-select'
import { BankTransactions } from '../../components/BankTransactions'
import { Container } from '../../components/Container'
import { DateRangeDatePickerModes } from '../../components/DatePicker/DatePicker'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
import { TagFilterInput } from '../../components/ProfitAndLossCompareOptions/ProfitAndLossCompareOptions'
import { Toggle } from '../../components/Toggle'
import { View } from '../../components/View'
import { useElementViewSize } from '../../hooks/useElementViewSize'
import { PnlTagFilter } from '../../hooks/useProfitAndLoss/useProfitAndLoss'
import { DisplayState, MoneyFormat } from '../../types'
import { View as ViewType } from '../../types/general'
import classNames from 'classnames'

type SelectOption = {
  label: string
  tagKey: string
  tagValues: string[]
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
  const [view, setView] = useState<ViewBreakpoint>('desktop')
  const [pnlToggle, setPnlToggle] = useState<PnlToggleOption>('expenses')
  const containerRef = useElementViewSize<HTMLDivElement>(newView =>
    setView(newView),
  )
  const [tagFilter, setTagFilter] = useState<SelectOption | null>(null)
  const [pnlTagFilter, setPnlTagFilter] = useState<PnlTagFilter | undefined>(
    undefined,
  )

  type ProjectTab = 'overview' | 'transactions' | 'report'
  const profitAndLossConfig: {
    datePickerMode?: DateRangeDatePickerModes
    csvMoneyFormat?: MoneyFormat
  } = {
    datePickerMode: 'monthPicker',
    csvMoneyFormat: 'DOLLAR_STRING',
  }

  const valueOptions: SelectOption[] = [
    {
      label: 'Project A',
      tagKey: 'project',
      tagValues: ['project-a'],
    },
    {
      label: 'Project B',
      tagKey: 'project',
      tagValues: ['project-b'],
    },
  ]

  const isOptionSelected = (
    option: SelectOption,
    selectValue: Options<SelectOption>,
  ) => {
    return selectValue.some(
      value =>
        value.tagKey === option.tagKey &&
        JSON.stringify(value.tagValues) === JSON.stringify(option.tagValues),
    )
  }

  const getTagFilter = (
    tagFilter: SelectOption | null,
  ): { key: string; values: string[] } | undefined => {
    return tagFilter &&
      tagFilter.tagKey &&
      tagFilter.tagValues &&
      tagFilter.tagValues.length > 0
      ? {
          key: tagFilter.tagKey,
          values: tagFilter.tagValues,
        }
      : undefined
  }

  return (
    <View title={stringOverrides?.title || ''} showHeader={showTitle}>
      <ProfitAndLoss asContainer={false} tagFilter={pnlTagFilter}>
        <Select
          className='Layer__category-menu Layer__select'
          classNamePrefix='Layer__select'
          options={valueOptions}
          placeholder='Select a project...'
          isOptionSelected={isOptionSelected}
          value={valueOptions.find(
            option =>
              tagFilter &&
              option.tagKey === tagFilter.tagKey &&
              JSON.stringify(option.tagValues) ===
                JSON.stringify(tagFilter.tagValues),
          )}
          onChange={selectedOption => {
            setTagFilter(selectedOption)
            setPnlTagFilter(getTagFilter(selectedOption))
          }}
        />
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
                  tagFilter: tagFilter ?? undefined,
                }}
              />
            )}
            {activeTab === 'report' && (
              <ProfitAndLoss.Report
                stringOverrides={stringOverrides}
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
