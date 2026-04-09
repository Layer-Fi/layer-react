import { type ReactNode, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('chartOfAccounts')

  const toggleOptions = useMemo(() => [
    {
      value: 'chartOfAccounts',
      label: stringOverrides?.chartOfAccountsToggleOption || t('chartOfAccounts:label.chart_of_accounts', 'Chart of Accounts'),
    },
    {
      value: 'journal',
      label: stringOverrides?.journalToggleOption || t('generalLedger:label.journal', 'Journal'),
    },
  ], [t, stringOverrides?.chartOfAccountsToggleOption, stringOverrides?.journalToggleOption])

  return (
    <ProfitAndLoss asContainer={false}>
      <View
        title={stringOverrides?.title || title || t('generalLedger:label.general_ledger', 'General Ledger')}
        showHeader={showTitle}
      >
        <Toggle
          ariaLabel={t('generalLedger:label.ledger_view', 'Ledger view')}
          options={toggleOptions}
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
