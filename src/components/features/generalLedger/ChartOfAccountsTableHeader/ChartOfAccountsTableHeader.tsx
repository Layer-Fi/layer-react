import { CirclePlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Button } from '@ui/Button/Button'
import { Header } from '@ui/Header/Header'
import { HeaderCol } from '@ui/Header/HeaderCol'
import { HeaderRow } from '@ui/Header/HeaderRow'
import { SearchField } from '@ui/SearchField/SearchField'
import { Heading } from '@ui/Typography/Heading'
import { LedgerDateRangeSelection } from '@blocks/DatePickers/DateSelection/LedgerDateRangeSelection'
import { ExpandableDataTableToggleButton } from '@blocks/ExpandableDataTable/ExpandableDataTableToggleButton'
import { AccountBalancesDownloadButton } from '@features/generalLedger/AccountBalancesDownloadButton/AccountBalancesDownloadButton'
import { type ChartOfAccountsTableStringOverrides } from '@features/generalLedger/ChartOfAccountsTableWithPanel/ChartOfAccountsTableWithPanel'

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
            filterByDateRange={withDateControl}
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
      <HeaderRow scrollable>
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
