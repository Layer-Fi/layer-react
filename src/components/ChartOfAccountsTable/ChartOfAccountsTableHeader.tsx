import { CirclePlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { AccountBalancesDownloadButton } from '@components/ChartOfAccounts/download/AccountBalancesDownloadButton'
import { type ChartOfAccountsTableStringOverrides } from '@components/ChartOfAccountsTable/ChartOfAccountsTableWithPanel'
import { ExpandableDataTableToggleButton } from '@components/ExpandableDataTable/ExpandableDataTableToggleButton'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'
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
  const addAccountLabel = stringOverrides?.addAccountButtonText || t('chartOfAccounts:action.add_account', 'Add Account')

  return (
    <>
      <Header asHeader rounded>
        <HeaderRow>
          <HeaderCol>
            <Heading level={asWidget ? 3 : 2} size={asWidget ? 'md' : 'lg'}>
              {stringOverrides?.headerText || t('chartOfAccounts:label.chart_of_accounts', 'Chart of Accounts')}
            </Heading>
          </HeaderCol>
        </HeaderRow>
      </Header>
      <Header sticky>
        <HeaderRow>
          <HeaderCol>
            {(withDateControl || withExpandAllButton) && (
              <HStack align='center' gap='xs'>
                {withDateControl && <GlobalMonthPicker />}
                {withExpandAllButton && <ExpandableDataTableToggleButton />}
              </HStack>
            )}
          </HeaderCol>
          <HeaderCol className='Layer__chart-of-accounts__actions'>
            <SearchField
              label={t('chartOfAccounts:label.search_accounts', 'Search accounts')}
              value={inputValue}
              onChange={onSearchChange}
            />
            <AccountBalancesDownloadButton
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
      </Header>
    </>
  )
}
