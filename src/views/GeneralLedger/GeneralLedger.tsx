import React, { useState } from 'react'
import { ChartOfAccounts } from '../../components/ChartOfAccounts'
import { Container } from '../../components/Container'
import { Journal } from '../../components/Journal'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
import { Toggle } from '../../components/Toggle'
import { View } from '../../components/View'

export interface GeneralLedgerProps {
  title?: string
}

export const GeneralLedgerView = ({
  title = 'General Ledger',
}: GeneralLedgerProps) => {
  const [activeTab, setActiveTab] = useState('chartOfAccounts')

  return (
    <ProfitAndLoss asContainer={false}>
      <View title={title}>
        <Toggle
          name='general-ledger-tabs'
          options={[
            {
              value: 'chartOfAccounts',
              label: 'Chart of accounts',
            },
            {
              value: 'journal',
              label: 'Journal',
            },
          ]}
          selected={activeTab}
          onChange={opt => setActiveTab(opt.target.value)}
        />
        <Container name='generalLedger'>
          {activeTab === 'chartOfAccounts' ? (
            <ChartOfAccounts asWidget withExpandAllButton />
          ) : (
            <Journal />
          )}
        </Container>
      </View>
    </ProfitAndLoss>
  )
}
