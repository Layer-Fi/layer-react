import React, { useState } from 'react'
import { ChartOfAccounts } from '../../components/ChartOfAccounts'
import { ChartOfAccountsStringOverrides } from '../../components/ChartOfAccounts/ChartOfAccounts'
import { Container } from '../../components/Container'
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

export interface GeneralLedgerProps {
  title?: string // deprecated
  stringOverrides?: GeneralLedgerStringOverrides
}

export const GeneralLedgerView = ({
  title, // deprecated
  stringOverrides,
}: GeneralLedgerProps) => {
  const [activeTab, setActiveTab] = useState('chartOfAccounts')

  return (
    <ProfitAndLoss asContainer={false}>
      <View title={stringOverrides?.title || title || 'General Ledger'}>
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
        <Container name='generalLedger'>
          {activeTab === 'chartOfAccounts' ? (
            <ChartOfAccounts
              asWidget
              withExpandAllButton
              stringOverrides={stringOverrides?.chartOfAccounts}
              withDateControl
            />
          ) : (
            <Journal stringOverrides={stringOverrides?.journal} />
          )}
        </Container>
      </View>
    </ProfitAndLoss>
  )
}
