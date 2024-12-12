import React, { RefObject, useContext, useState } from 'react'
import { ChartOfAccountsContext } from '../../contexts/ChartOfAccountsContext'
import PlusIcon from '../../icons/Plus'
import { View } from '../../types/general'
import { Button, ButtonVariant, ExpandCollapseButton } from '../Button'
import { ChartOfAccountsDatePicker } from '../ChartOfAccountsDatePicker'
import { ChartOfAccountsFormStringOverrides } from '../ChartOfAccountsForm/ChartOfAccountsForm'
import { ChartOfAccountsSidebar } from '../ChartOfAccountsSidebar'
import { DataState, DataStateStatus } from '../DataState'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { Loader } from '../Loader'
import { Panel } from '../Panel'
import { Heading, HeadingSize } from '../Typography'
import { ChartOfAccountsTable } from './ChartOfAccountsTable'
import { AccountBalancesDownloadButton } from '../ChartOfAccounts/download/AccountBalancesDownloadButton'

const COMPONENT_NAME = 'chart-of-accounts'
export type ExpandActionState = undefined | 'expanded' | 'collapsed'

export interface ChartOfAccountsTableStringOverrides {
  headerText?: string
  addAccountButtonText?: string
  csvDownloadButtonText?: string
  nameColumnHeader?: string
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
  const { data, isLoading, addAccount, error, isValidating, refetch, form } =
    useContext(ChartOfAccountsContext)

  const [expandAll, setExpandAll] = useState<ExpandActionState>()

  const cumulativeIndex = 0
  const accountsLength = data?.accounts.length ?? 0

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
                  <div className='Layer__header__actions-col'>
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
                  </div>
                )
                : null}
            </Heading>
          </HeaderCol>
          <HeaderCol>
            <AccountBalancesDownloadButton
              iconOnly={['mobile', 'tablet'].includes(view)}
            />
            {showAddAccountButton && (
              <Button
                onClick={() => addAccount()}
                disabled={isLoading}
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
          error={error}
          stringOverrides={stringOverrides}
          expandAll={expandAll}
          accountsLength={accountsLength}
          cumulativeIndex={cumulativeIndex}
          templateAccountsEditable={templateAccountsEditable}
        />
      )}

      {error
        ? (
          <div className='Layer__table-state-container'>
            <DataState
              status={DataStateStatus.failed}
              title='Something went wrong'
              description='We couldn’t load your data.'
              onRefresh={() => refetch()}
              isLoading={isValidating || isLoading}
            />
          </div>
        )
        : null}

      {(!data || isLoading) && !error
        ? (
          <div className={`Layer__${COMPONENT_NAME}__loader-container`}>
            <Loader />
          </div>
        )
        : null}

      {!isLoading && !error && data?.accounts.length === 0
        ? (
          <div className='Layer__table-state-container'>
            <DataState
              status={DataStateStatus.info}
              title='Accounts were not found'
              description='New account can be created with "Add Account".'
              onRefresh={() => refetch()}
              isLoading={isValidating}
            />
          </div>
        )
        : null}
    </Panel>
  )
}
