import React, { useEffect, useState } from 'react'
import Select, { Options } from 'react-select'
import { BankTransactions } from '../../components/BankTransactions'
import { Container } from '../../components/Container'
import { DateRangeDatePickerModes } from '../../components/DatePicker/DatePicker'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
import { Toggle } from '../../components/Toggle'
import { TransactionToReviewCard } from '../../components/TransactionToReviewCard'
import { View } from '../../components/View'
import { useElementViewSize } from '../../hooks/useElementViewSize'
import { DisplayState, MoneyFormat } from '../../types'
import { View as ViewType } from '../../types/general'
import { AccountingOverview } from '../AccountingOverview'
import classNames from 'classnames'

export type TagOption = {
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
  const [activeTab, setActiveTab] = useState<ProjectTab>('overview')
  const [view, setView] = useState<ViewBreakpoint>('desktop')
  const [pnlToggle, setPnlToggle] = useState<PnlToggleOption>('expenses')
  const containerRef = useElementViewSize<HTMLDivElement>(newView =>
    setView(newView),
  )
  const [tagFilter, setTagFilter] = useState<TagOption | null>(null)

  type ProjectTab = 'overview' | 'transactions' | 'report'

  const comparisonConfig = undefined
  const profitAndLossConfig: {
    datePickerMode?: DateRangeDatePickerModes
    csvMoneyFormat?: MoneyFormat
  } = {
    datePickerMode: 'monthPicker',
    csvMoneyFormat: 'DOLLAR_STRING',
  }

  const valueOptions: TagOption[] = [
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
    {
      label: 'Project C',
      tagKey: 'project',
      tagValues: ['project-c'],
    },
  ]

  const isOptionSelected = (
    option: TagOption,
    selectValue: Options<TagOption>,
  ) => {
    return selectValue.some(
      value =>
        value.tagKey === option.tagKey &&
        JSON.stringify(value.tagValues) === JSON.stringify(option.tagValues),
    )
  }

  return (
    <View title={stringOverrides?.title || ''} showHeader={showTitle}>
      <Select
        className='Layer__category-menu Layer__select'
        classNamePrefix='Layer__select'
        options={valueOptions}
        placeholder='Select a project...'
        isOptionSelected={isOptionSelected}
        defaultValue={valueOptions.find(o => (o.label = 'Project A'))}
        value={valueOptions.find(
          option =>
            tagFilter &&
            option.tagKey === tagFilter.tagKey &&
            JSON.stringify(option.tagValues) ===
              JSON.stringify(tagFilter.tagValues),
        )}
        onChange={selectedOption => setTagFilter(selectedOption)}
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
      <ProfitAndLoss asContainer={false}>
        <Container name='project' ref={containerRef}>
          <>
            {activeTab === 'overview' && (
              <AccountingOverview
                stringOverrides={{}}
                tagFilter={tagFilter ? tagFilter : undefined}
                onTransactionsToReviewClick={() => {
                  console.log('clicked')
                }}
                enableOnboarding={false}
              />
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
