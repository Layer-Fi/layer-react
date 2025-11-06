import { useState } from 'react'
import Select, { Options } from 'react-select'
import { BankTransactions } from '@components/BankTransactions/BankTransactions'
import { Container } from '@components/Container/Container'
import { ProfitAndLoss } from '@components/ProfitAndLoss/ProfitAndLoss'
import { Toggle } from '@components/Toggle/Toggle'
import { View } from '@components/View/View'
import { PnlTagFilter } from '@hooks/useProfitAndLoss/useProfitAndLoss'
import { MoneyFormat } from '@internal-types/general'
import { DisplayState } from '@internal-types/bank_transactions'
import { AccountingOverview } from '@views/AccountingOverview/AccountingOverview'
import type { DateRangePickerMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import './projectProfitability.scss'

export type TagOption = {
  label: string
  tagKey: string
  tagValues: string[]
}

export interface ProjectsStringOverrides {
  title?: string
}

export interface ProjectProfitabilityProps {
  valueOptions: TagOption[]
  showTitle?: boolean
  stringOverrides?: ProjectsStringOverrides
  datePickerMode?: DateRangePickerMode
  csvMoneyFormat?: MoneyFormat
}

export const ProjectProfitabilityView = ({
  valueOptions,
  showTitle,
  stringOverrides,
  datePickerMode = 'monthPicker',
  csvMoneyFormat = 'DOLLAR_STRING',
}: ProjectProfitabilityProps) => {
  const [activeTab, setActiveTab] = useState<ProjectTab>('overview')
  const [tagFilter, setTagFilter] = useState<TagOption | null>(null)
  const [pnlTagFilter, setPnlTagFilter] = useState<PnlTagFilter | undefined>(
    undefined,
  )

  type ProjectTab = 'overview' | 'transactions' | 'report'

  const isOptionSelected = (
    option: TagOption,
    selectValue: Options<TagOption>,
  ) => {
    return selectValue.some(
      value =>
        value.tagKey === option.tagKey
        && JSON.stringify(value.tagValues) === JSON.stringify(option.tagValues),
    )
  }

  const getTagFilter = (
    tagFilter: TagOption | null,
  ): { key: string, values: string[] } | undefined => {
    return tagFilter
      && tagFilter.tagKey
      && tagFilter.tagValues
      && tagFilter.tagValues.length > 0
      ? {
        key: tagFilter.tagKey,
        values: tagFilter.tagValues,
      }
      : undefined
  }

  return (
    <View
      title={stringOverrides?.title || ''}
      showHeader={showTitle}
      viewClassName='Layer__project-view'
    >
      <div className='Layer__component Layer__header__actions'>
        <div className='Layer__component'>
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
        <Select
          className='Layer__category-menu Layer__select'
          classNamePrefix='Layer__select'
          options={valueOptions}
          placeholder='Select a project...'
          isOptionSelected={isOptionSelected}
          defaultValue={valueOptions.length > 0 ? valueOptions[0] : undefined}
          value={valueOptions.find(
            option =>
              tagFilter
              && option.tagKey === tagFilter.tagKey
              && JSON.stringify(option.tagValues)
              === JSON.stringify(tagFilter.tagValues),
          )}
          onChange={(selectedOption) => {
            setTagFilter(selectedOption)
            setPnlTagFilter(getTagFilter(selectedOption))
          }}
        />
      </div>
      <Container name='project'>
        <>
          {activeTab === 'overview' && (
            <AccountingOverview
              stringOverrides={{ header: 'Project Overview' }}
              tagFilter={tagFilter ? tagFilter : undefined}
              onTransactionsToReviewClick={() => setActiveTab('transactions')}
              enableOnboarding={false}
              showTitle={false}
            />
          )}
          {activeTab === 'transactions' && (
            <BankTransactions
              hideHeader={true}
              filters={{
                categorizationStatus: DisplayState.categorized,
                tagFilter: tagFilter ?? undefined,
              }}
            />
          )}
          {activeTab === 'report' && (
            <ProfitAndLoss asContainer={false} tagFilter={pnlTagFilter}>
              <ProfitAndLoss.Report
                stringOverrides={stringOverrides}
                datePickerMode={datePickerMode}
                csvMoneyFormat={csvMoneyFormat}
              />
            </ProfitAndLoss>
          )}
        </>
      </Container>
    </View>
  )
}
