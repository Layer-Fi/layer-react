import { CirclePlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Button } from '@ui/Button/Button'
import { SearchField } from '@ui/SearchField/SearchField'
import { Heading } from '@ui/Typography/Heading'
import { LedgerDateRangeSelection } from '@blocks/DatePickers/DateSelection/LedgerDateRangeSelection'
import { ViewHeader } from '@blocks/Layout/View/ViewHeader/ViewHeader'
import { ExpandableDataTableToggleButton } from '@blocks/Table/ExpandableDataTable/ExpandableDataTableToggleButton'
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
  const addAccountLabel = stringOverrides?.addAccountButtonText || t('generalLedger:ChartOfAccountsTableHeader.action.add_account', 'Add Account')

  return (
    <ViewHeader
      surface='panel'
      asHeader
      sticky
      rounded
      slots={{
        Title: (
          <Heading level={asWidget ? 3 : 2} size={asWidget ? 'md' : 'lg'}>
            {stringOverrides?.headerText || t('generalLedger:ChartOfAccountsTableHeader.label.chart_of_accounts', 'Chart of Accounts')}
          </Heading>
        ),
        Actions: (
          <>
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
          </>
        ),
        Filters: withDateControl ? <LedgerDateRangeSelection /> : undefined,
        FilterActions: (
          <SearchField
            className='Layer__chart-of-accounts__actions'
            label={t('generalLedger:ChartOfAccountsTableHeader.label.search_accounts', 'Search accounts')}
            value={inputValue}
            onChange={onSearchChange}
          />
        ),
      }}
    />
  )
}
