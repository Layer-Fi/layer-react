import { type ReactNode, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type LinkingMetadata } from '@providers/common/InAppLink/InAppLinkContext'
import { LedgerDateStoreProvider } from '@providers/features/generalLedger/LedgerDateStore/LedgerDateStoreProvider'
import { withUsageTracking } from '@components/utility/withUsageTracking'
import { Loader } from '@ui/Loader/Loader'
import { Toggle } from '@ui/Toggle/Toggle'
import { View } from '@blocks/Layout/View/View'
import { InternalChartOfAccounts } from '@features/generalLedger/ChartOfAccounts/ChartOfAccounts'
import { type ChartOfAccountsStringOverrides } from '@features/generalLedger/ChartOfAccounts/ChartOfAccounts'
import { InternalJournal } from '@features/generalLedger/Journal/Journal'
import { type JournalStringOverrides } from '@features/generalLedger/Journal/Journal'
import { ProfitAndLoss } from '@features/profitAndLoss/ProfitAndLoss/ProfitAndLoss'

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

const GeneralLedgerViewComponent = ({
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
      label: stringOverrides?.chartOfAccountsToggleOption || t('views:GeneralLedger.label.chart_of_accounts', 'Chart of Accounts'),
    },
    {
      value: 'journal',
      label: stringOverrides?.journalToggleOption || t('views:GeneralLedger.label.journal', 'Journal'),
    },
  ], [t, stringOverrides?.chartOfAccountsToggleOption, stringOverrides?.journalToggleOption])

  return (
    <ProfitAndLoss asContainer={false}>
      <View
        title={stringOverrides?.title || title || t('views:GeneralLedger.label.general_ledger', 'General Ledger')}
        showHeader={showTitle}
      >
        <Toggle
          ariaLabel={t('views:GeneralLedger.label.ledger_view', 'Ledger view')}
          options={toggleOptions}
          selectedKey={activeTab}
          onSelectionChange={key => setActiveTab(key as string)}
        />

        <LedgerDateStoreProvider fallback={<Loader />}>
          {activeTab === 'chartOfAccounts'
            ? (
              <InternalChartOfAccounts
                asWidget
                withDateControl
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
              <InternalJournal
                showTags={showTags}
                showCustomerVendor={showCustomerVendor}
                stringOverrides={stringOverrides?.journal}
                renderInAppLink={renderInAppLink}
              />
            )}
        </LedgerDateStoreProvider>
      </View>
    </ProfitAndLoss>
  )
}

export const GeneralLedgerView = withUsageTracking('GeneralLedgerView', GeneralLedgerViewComponent)
