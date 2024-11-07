import React, { useState } from 'react'
import { ChartOfAccounts } from '../../components/ChartOfAccounts'
import { ChartOfAccountsStringOverrides } from '../../components/ChartOfAccounts/ChartOfAccounts'
import { Journal } from '../../components/Journal'
import { JournalStringOverrides } from '../../components/Journal/Journal'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
import { Toggle } from '../../components/Toggle'
import { View } from '../../components/View'

export interface GeneralLedgerStringOverrides {
  title?: string
  chartOfAccountsToggleOption?: string
  journalToggleOption?: string
  chartOfAccounts: ChartOfAccountsStringOverrides
  journal: JournalStringOverrides
}

export interface ChartOfAccountsOptions {
  templateAccountsEditable?: boolean
  showReversalEntries?: boolean
}
export interface GeneralLedgerProps {
  title?: string // deprecated
  showTitle?: boolean
  stringOverrides?: GeneralLedgerStringOverrides
  chartOfAccountsOptions?: ChartOfAccountsOptions
}

export const GeneralLedgerView = ({
  title, // deprecated
  showTitle = true,
  stringOverrides,
  chartOfAccountsOptions,
}: GeneralLedgerProps) => {
  const [activeTab, setActiveTab] = useState('chartOfAccounts')

  return (
    <ProfitAndLoss asContainer={false}>
      <View
        title={stringOverrides?.title || title || 'General Ledger'}
        showHeader={showTitle}
      >
        <Toggle
          name='general-ledger-tabs'
          options={[
            {
              value: 'chartOfAccounts',
              label:
                stringOverrides?.chartOfAccountsToggleOption ||
                'Chart of accounts',
            },
            {
              value: 'journal',
              label: stringOverrides?.journalToggleOption || 'Journal',
            },
          ]}
          selected={activeTab}
          onChange={opt => setActiveTab(opt.target.value)}
        />

        {activeTab === 'chartOfAccounts' ? (
          <ChartOfAccounts
            asWidget
            withExpandAllButton
            stringOverrides={stringOverrides?.chartOfAccounts}
            templateAccountsEditable={
              chartOfAccountsOptions?.templateAccountsEditable
            }
            showReversalEntries={chartOfAccountsOptions?.showReversalEntries}
          />
        ) : (
          <Journal stringOverrides={stringOverrides?.journal} />
        )}
      </View>
    </ProfitAndLoss>
  )
}
