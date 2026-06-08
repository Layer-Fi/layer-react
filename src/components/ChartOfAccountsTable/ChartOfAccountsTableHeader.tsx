import { useContext } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { ChartOfAccountsContext } from '@contexts/ChartOfAccountsContext/ChartOfAccountsContext'
import { HStack } from '@ui/Stack/Stack'
import { Button } from '@components/Button/Button'
import { AccountBalancesDownloadButton } from '@components/ChartOfAccounts/download/AccountBalancesDownloadButton'
import { type ChartOfAccountsTableStringOverrides } from '@components/ChartOfAccountsTable/ChartOfAccountsTableWithPanel'
import { ExpandableDataTableToggleButton } from '@components/ExpandableDataTable/ExpandableDataTableToggleButton'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { SearchField } from '@components/SearchField/SearchField'
import { Heading, HeadingSize } from '@components/Typography/Heading'

import './chartOfAccountsTableHeader.scss'

type ChartOfAccountsTableHeaderProps = {
  asWidget: boolean
  withDateControl: boolean
  withExpandAllButton: boolean
  showAddAccountButton: boolean
  inputValue: string
  onSearchChange: (value: string) => void
  stringOverrides?: ChartOfAccountsTableStringOverrides
}

export const ChartOfAccountsTableHeader = ({
  asWidget,
  withDateControl,
  withExpandAllButton,
  showAddAccountButton,
  inputValue,
  onSearchChange,
  stringOverrides,
}: ChartOfAccountsTableHeaderProps) => {
  const { t } = useTranslation()
  const { addAccount } = useContext(ChartOfAccountsContext)
  const { isDesktop } = useSizeClass()

  return (
    <>
      <Header asHeader rounded>
        <HeaderRow>
          <HeaderCol>
            <Heading
              size={asWidget ? HeadingSize.view : HeadingSize.primary}
            >
              {stringOverrides?.headerText || t('chartOfAccounts:label.chart_of_accounts', 'Chart of Accounts')}
            </Heading>
          </HeaderCol>
        </HeaderRow>
      </Header>
      <Header sticky>
        <HeaderRow>
          <HeaderCol>
            <Heading
              size={HeadingSize.secondary}
            >
              {withDateControl || withExpandAllButton
                ? (
                  <HStack align='center' gap='xs'>
                    {withDateControl && <GlobalMonthPicker />}
                    {withExpandAllButton && <ExpandableDataTableToggleButton />}
                  </HStack>
                )
                : null}
            </Heading>
          </HeaderCol>
          <HeaderCol className='Layer__chart-of-accounts__actions'>
            <SearchField
              label={t('chartOfAccounts:label.search_accounts', 'Search accounts')}
              value={inputValue}
              onChange={onSearchChange}
            />
            <AccountBalancesDownloadButton
              iconOnly={!isDesktop}
            />
            {showAddAccountButton && (
              <Button
                onClick={() => addAccount()}
                iconOnly={!isDesktop}
                leftIcon={
                  !isDesktop && <Plus size={14} />
                }
              >
                {stringOverrides?.addAccountButtonText || t('chartOfAccounts:action.add_account', 'Add Account')}
              </Button>
            )}
          </HeaderCol>
        </HeaderRow>
      </Header>
    </>
  )
}
