import { ReactNode, useState } from 'react'
import { ChartOfAccounts } from '../../components/ChartOfAccounts'
import { ChartOfAccountsStringOverrides } from '../../components/ChartOfAccounts/ChartOfAccounts'
import { Journal } from '../../components/Journal'
import { JournalStringOverrides } from '../../components/Journal/Journal'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
import { Toggle } from '../../components/Toggle'
import { View } from '../../components/View'
import { LinkingMetadata } from '../../contexts/InAppLinkContext'

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
  stringOverrides?: GeneralLedgerStringOverrides
  chartOfAccountsOptions?: ChartOfAccountsOptions
  renderInAppLink?: (source: LinkingMetadata) => ReactNode | undefined
}

export const GeneralLedgerView = ({
  title, // deprecated
  showTitle = true,
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
          name='general-ledger-tabs'
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
          selected={activeTab}
          onChange={opt => setActiveTab(opt.target.value)}
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
              stringOverrides={stringOverrides?.journal}
              renderInAppLink={renderInAppLink}
            />
          )}
      </View>
    </ProfitAndLoss>
  )
}
