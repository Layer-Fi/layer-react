import { CirclePlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useLedgerDateRange } from '@providers/LedgerDateStore/LedgerDateStoreProvider'
import { Button } from '@ui/Button/Button'
import { Heading } from '@ui/Typography/Heading'
import { AccountBalancesDownloadButton } from '@components/ChartOfAccounts/download/AccountBalancesDownloadButton'
import { type ChartOfAccountsTableStringOverrides } from '@components/ChartOfAccountsTable/ChartOfAccountsTableWithPanel'
import { LedgerDateRangeSelection } from '@components/DateSelection/LedgerDateRangeSelection'
import { ExpandableDataTableToggleButton } from '@components/ExpandableDataTable/ExpandableDataTableToggleButton'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { SearchField } from '@components/SearchField/SearchField'

import './chartOfAccountsTableHeader.scss'

type ChartOfAccountsTableHeaderProps = {
  asWidget: boolean
  withDateControl: boolean
  withExpandAllButton: boolean
  showAddAccountButton: boolean
  onAddAccount: () => void
  inputValue: string
  onSearchChange: (value: string) => void
  stringOverrides?: ChartOfAccountsTableStringOverrides
}

export const ChartOfAccountsTableHeader = ({
  asWidget,
  withDateControl,
  withExpandAllButton,
  showAddAccountButton,
  onAddAccount,
  inputValue,
  onSearchChange,
  stringOverrides,
}: ChartOfAccountsTableHeaderProps) => {
  const { t } = useTranslation()
  const { isDesktop } = useSizeClass()
  const { startDate, endDate } = useLedgerDateRange({ dateSelectionMode: 'full' })
  const addAccountLabel = stringOverrides?.addAccountButtonText || t('chartOfAccounts:action.add_account', 'Add Account')

  return (
    <Header asHeader sticky rounded>
      <HeaderRow>
        <HeaderCol>
          <Heading level={asWidget ? 3 : 2} size={asWidget ? 'md' : 'lg'}>
            {stringOverrides?.headerText || t('chartOfAccounts:label.chart_of_accounts', 'Chart of Accounts')}
          </Heading>
        </HeaderCol>
        <HeaderCol>
          {withExpandAllButton && <ExpandableDataTableToggleButton />}
          <AccountBalancesDownloadButton
            startDate={withDateControl ? startDate : undefined}
            endDate={withDateControl ? endDate : undefined}
            icon={!isDesktop}
          />
          {showAddAccountButton && (
            <Button
              onPress={() => onAddAccount()}
              icon={!isDesktop}
              aria-label={!isDesktop ? addAccountLabel : undefined}
            >
              {isDesktop ? addAccountLabel : <CirclePlus size={14} />}
            </Button>
          )}
        </HeaderCol>
      </HeaderRow>
      <HeaderRow>
        <HeaderCol>
          {withDateControl && <LedgerDateRangeSelection />}
        </HeaderCol>
        <HeaderCol className='Layer__chart-of-accounts__actions'>
          <SearchField
            label={t('chartOfAccounts:label.search_accounts', 'Search accounts')}
            value={inputValue}
            onChange={onSearchChange}
          />
        </HeaderCol>
      </HeaderRow>
    </Header>
  )
}
