import { type ReactNode, useState } from 'react'

import { type LinkingMetadata } from '@contexts/InAppLinkContext'
import { Toggle } from '@ui/Toggle/Toggle'
import { ChartOfAccounts } from '@components/ChartOfAccounts/ChartOfAccounts'
import { type ChartOfAccountsStringOverrides } from '@components/ChartOfAccounts/ChartOfAccounts'
import { Journal } from '@components/Journal/Journal'
import { type JournalStringOverrides } from '@components/Journal/Journal'
import { ProfitAndLoss } from '@components/ProfitAndLoss/ProfitAndLoss'
import { View } from '@components/View/View'

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
  showAddAccountButton?: boolean
}
export interface GeneralLedgerProps {
  title?: string // deprecated
  showTitle?: boolean
  showTags?: boolean
  showCustomerVendor?: boolean
  stringOverrides?: GeneralLedgerStringOverrides
  chartOfAccountsOptions?: ChartOfAccountsOptions
  renderInAppLink?: (source: LinkingMetadata) => ReactNode
}

export const GeneralLedgerView = ({
  title, // deprecated
  showTitle = true,
  showTags = true,
  showCustomerVendor = true,
  stringOverrides,
  chartOfAccountsOptions,
  renderInAppLink,
}: GeneralLedgerProps) => {
  const [activeTab, setActiveTab] = useState('chartOfAccounts')

  return (
    <ProfitAndLoss asContainer={false}>
      <View
        title={stringOverrides?.title || title || 'General Ledger'}
        showHeader={showTitle}
      >
        <Toggle
          options={[
            {
              value: 'chartOfAccounts',
              label:
                stringOverrides?.chartOfAccountsToggleOption
                || 'Chart of Accounts',
            },
            {
              value: 'journal',
              label: stringOverrides?.journalToggleOption || 'Journal',
            },
          ]}
          selectedKey={activeTab}
          onSelectionChange={key => setActiveTab(key as string)}
        />

        {activeTab === 'chartOfAccounts'
          ? (
            <ChartOfAccounts
              asWidget
              withExpandAllButton
              showAddAccountButton={chartOfAccountsOptions?.showAddAccountButton}
              stringOverrides={stringOverrides?.chartOfAccounts}
              templateAccountsEditable={
                chartOfAccountsOptions?.templateAccountsEditable
              }
              showReversalEntries={chartOfAccountsOptions?.showReversalEntries}
              renderInAppLink={renderInAppLink}
            />
          )
          : (
            <Journal
              showTags={showTags}
              showCustomerVendor={showCustomerVendor}
              stringOverrides={stringOverrides?.journal}
              renderInAppLink={renderInAppLink}
            />
          )}
      </View>
    </ProfitAndLoss>
  )
}
