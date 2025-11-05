import { ExpandCollapseButton } from '../Button/ExpandCollapseButton'
import { Button, ButtonVariant } from '../Button'
import { RefObject, useContext, useState } from 'react'
import { ChartOfAccountsContext } from '../../contexts/ChartOfAccountsContext/ChartOfAccountsContext'
import PlusIcon from '../../icons/Plus'
import { View } from '../../types/general'
import { ChartOfAccountsDatePicker } from '../ChartOfAccountsDatePicker/ChartOfAccountsDatePicker'
import { ChartOfAccountsFormStringOverrides } from '../ChartOfAccountsForm/ChartOfAccountsForm'
import { ChartOfAccountsSidebar } from '../ChartOfAccountsSidebar/ChartOfAccountsSidebar'
import { DataState, DataStateStatus } from '../DataState/DataState'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { Loader } from '../Loader'
import { Panel } from '../Panel/Panel'
import { Heading, HeadingSize } from '../Typography'
import { ChartOfAccountsTable } from './ChartOfAccountsTable'
import { AccountBalancesDownloadButton } from '../ChartOfAccounts/download/AccountBalancesDownloadButton'
import { HStack } from '../ui/Stack/Stack'
import { SearchField } from '../SearchField/SearchField'
import { useDebouncedSearchInput } from '../../hooks/search/useDebouncedSearchQuery'

const COMPONENT_NAME = 'chart-of-accounts'
export type ExpandActionState = undefined | 'expanded' | 'collapsed'

export interface ChartOfAccountsTableStringOverrides {
  headerText?: string
  addAccountButtonText?: string
  csvDownloadButtonText?: string
  nameColumnHeader?: string
  numberColumnHeader?: string
  typeColumnHeader?: string
  balanceColumnHeader?: string
  subtypeColumnHeader?: string
  chartOfAccountsForm?: ChartOfAccountsFormStringOverrides
}

export const ChartOfAccountsTableWithPanel = ({
  view,
  containerRef,
  asWidget = false,
  withDateControl = false,
  withExpandAllButton = false,
  showAddAccountButton = true,
  stringOverrides,
  templateAccountsEditable,
}: {
  view: View
  containerRef: RefObject<HTMLDivElement>
  asWidget?: boolean
  withDateControl?: boolean
  withExpandAllButton?: boolean
  showAddAccountButton?: boolean
  stringOverrides?: ChartOfAccountsTableStringOverrides
  templateAccountsEditable?: boolean
}) => {
  const { data, isLoading, addAccount, isError, isValidating, refetch, form } =
    useContext(ChartOfAccountsContext)

  const [expandAll, setExpandAll] = useState<ExpandActionState>()
  const { inputValue, searchQuery, handleInputChange } = useDebouncedSearchInput({ initialInputState: '' })

  return (
    <Panel
      sidebar={(
        <ChartOfAccountsSidebar
          parentRef={containerRef}
          stringOverrides={stringOverrides?.chartOfAccountsForm}
        />
      )}
      sidebarIsOpen={Boolean(form)}
      parentRef={containerRef}
    >
      <Header className={`Layer__${COMPONENT_NAME}__header`} asHeader rounded>
        <HeaderRow>
          <HeaderCol>
            <Heading
              className={`Layer__${COMPONENT_NAME}__title`}
              size={asWidget ? HeadingSize.view : HeadingSize.primary}
            >
              {stringOverrides?.headerText || 'Chart of Accounts'}
            </Heading>
          </HeaderCol>
        </HeaderRow>
      </Header>
      <Header className={`Layer__${COMPONENT_NAME}__header`} sticky>
        <HeaderRow>
          <HeaderCol>
            <Heading
              size={HeadingSize.secondary}
              className={`Layer__${COMPONENT_NAME}__subtitle`}
            >
              {withDateControl || withExpandAllButton
                ? (
                  <HStack align='center' gap='xs'>
                    {withDateControl && <ChartOfAccountsDatePicker />}
                    {withExpandAllButton && (
                      <ExpandCollapseButton
                        iconOnly={view === 'mobile'}
                        onClick={() =>
                          setExpandAll(
                            !expandAll || expandAll === 'collapsed'
                              ? 'expanded'
                              : 'collapsed',
                          )}
                        expanded={!(!expandAll || expandAll === 'collapsed')}
                        variant={ButtonVariant.secondary}
                      />
                    )}
                  </HStack>
                )
                : null}
            </Heading>
          </HeaderCol>
          <HeaderCol className='Layer__chart-of-accounts__actions'>
            <SearchField label='Search accounts' value={inputValue} onChange={handleInputChange} />
            <AccountBalancesDownloadButton
              iconOnly={['mobile', 'tablet'].includes(view)}
            />
            {showAddAccountButton && (
              <Button
                onClick={() => addAccount()}
                iconOnly={['mobile', 'tablet'].includes(view)}
                leftIcon={
                  ['mobile', 'tablet'].includes(view) && <PlusIcon size={14} />
                }
              >
                {stringOverrides?.addAccountButtonText || 'Add Account'}
              </Button>
            )}
          </HeaderCol>
        </HeaderRow>
      </Header>

      {data && (
        <ChartOfAccountsTable
          view={view}
          data={data}
          searchQuery={searchQuery}
          stringOverrides={stringOverrides}
          expandAll={expandAll}
          templateAccountsEditable={templateAccountsEditable}
        />
      )}

      {isError
        ? (
          <div className='Layer__table-state-container'>
            <DataState
              status={DataStateStatus.failed}
              title='Something went wrong'
              description='We couldn’t load your data.'
              onRefresh={() => void refetch()}
              isLoading={isValidating || isLoading}
            />
          </div>
        )
        : null}

      {(!data || isLoading) && !isError
        ? (
          <div className={`Layer__${COMPONENT_NAME}__loader-container`}>
            <Loader />
          </div>
        )
        : null}
    </Panel>
  )
}
