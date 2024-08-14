import React, { RefObject, useContext, useState } from 'react'
import { ChartOfAccountsContext } from '../../contexts/ChartOfAccountsContext'
import PlusIcon from '../../icons/Plus'
import { Button, ButtonVariant } from '../Button'
import { View } from '../ChartOfAccounts/ChartOfAccounts'
import { ChartOfAccountsDatePicker } from '../ChartOfAccountsDatePicker'
import { ChartOfAccountsFormStringOverrides } from '../ChartOfAccountsForm/ChartOfAccountsForm'
import { ChartOfAccountsRow } from '../ChartOfAccountsRow'
import { ChartOfAccountsSidebar } from '../ChartOfAccountsSidebar'
import { DataState, DataStateStatus } from '../DataState'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { Loader } from '../Loader'
import { Panel } from '../Panel'
import { Heading, HeadingSize } from '../Typography'

const COMPONENT_NAME = 'chart-of-accounts'
export type ExpandActionState = undefined | 'expanded' | 'collapsed'

export interface ChartOfAccountsTableStringOverrides {
  headerText?: string
  addAccountButtonText?: string
  nameColumnHeader?: string
  typeColumnHeader?: string
  balanceColumnHeader?: string
  subtypeColumnHeader?: string
  chartOfAccountsForm?: ChartOfAccountsFormStringOverrides
}

export const ChartOfAccountsTable = ({
  view,
  containerRef,
  asWidget = false,
  withDateControl = false,
  withExpandAllButton = false,
  stringOverrides,
}: {
  view: View
  containerRef: RefObject<HTMLDivElement>
  asWidget?: boolean
  withDateControl?: boolean
  withExpandAllButton?: boolean
  stringOverrides?: ChartOfAccountsTableStringOverrides
}) => {
  const { data, isLoading, addAccount, error, isValidating, refetch, form } =
    useContext(ChartOfAccountsContext)

  const [expandAll, setExpandAll] = useState<ExpandActionState>()

  let cumulativeIndex = 0
  const accountsLength = data?.accounts.length ?? 0

  return (
    <Panel
      sidebar={
        <ChartOfAccountsSidebar
          parentRef={containerRef}
          stringOverrides={stringOverrides?.chartOfAccountsForm}
        />
      }
      sidebarIsOpen={Boolean(form)}
      parentRef={containerRef}
    >
      <Header
        className={`Layer__${COMPONENT_NAME}__header`}
        asHeader
        sticky
        rounded
      >
        <HeaderRow>
          <HeaderCol>
            <Heading
              className={`Layer__${COMPONENT_NAME}__title`}
              size={asWidget ? HeadingSize.secondary : HeadingSize.primary}
            >
              {stringOverrides?.headerText || 'Chart of Accounts'}
            </Heading>
          </HeaderCol>
        </HeaderRow>
      </Header>
      <Header className={`Layer__${COMPONENT_NAME}__header`}>
        <HeaderRow>
          <HeaderCol>
            <Heading
              size={HeadingSize.secondary}
              className={`Layer__${COMPONENT_NAME}__subtitle`}
            >
              {withDateControl || withExpandAllButton ? (
                <div className='Layer__header__actions-col'>
                  {withDateControl && <ChartOfAccountsDatePicker />}
                  {withExpandAllButton && (
                    <Button
                      className='Layer__hidden-xs'
                      variant={
                        withDateControl
                          ? ButtonVariant.tertiary
                          : ButtonVariant.secondary
                      }
                      onClick={() =>
                        setExpandAll(
                          !expandAll || expandAll === 'collapsed'
                            ? 'expanded'
                            : 'collapsed',
                        )
                      }
                    >
                      {!expandAll || expandAll === 'collapsed'
                        ? 'Expand all rows'
                        : 'Collapse all rows'}
                    </Button>
                  )}
                </div>
              ) : null}
            </Heading>
          </HeaderCol>
          <HeaderCol>
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
          </HeaderCol>
        </HeaderRow>
      </Header>

      <div className='Layer__chart-of-accounts__table-container'>
        <table className='Layer__chart-of-accounts__table'>
          <thead>
            <tr className='Layer__table-row--header'>
              <th className='Layer__table-header Layer__coa__name'>
                {stringOverrides?.nameColumnHeader || 'Name'}
              </th>
              <th className='Layer__table-header Layer__coa__type'>
                {stringOverrides?.typeColumnHeader || 'Type'}
              </th>
              <th className='Layer__table-header Layer__coa__subtype Layer__mobile--hidden'>
                {stringOverrides?.subtypeColumnHeader || 'Sub-Type'}
              </th>
              <th className='Layer__table-header Layer__coa__balance'>
                {stringOverrides?.balanceColumnHeader || 'Balance'}
              </th>
              <th className='Layer__table-header Layer__coa__actions' />
            </tr>
          </thead>

          <tbody>
            {!error &&
              data?.accounts.map((account, idx) => {
                const currentCumulativeIndex = cumulativeIndex
                cumulativeIndex =
                  (account.sub_accounts?.length || 0) + cumulativeIndex + 1

                return (
                  <ChartOfAccountsRow
                    key={account.id}
                    account={account}
                    depth={0}
                    index={idx}
                    cumulativeIndex={currentCumulativeIndex}
                    expanded={true}
                    defaultOpen={true}
                    acountsLength={accountsLength}
                    view={view}
                    expandAll={expandAll}
                  />
                )
              })}
          </tbody>
        </table>
      </div>

      {error ? (
        <div className='Layer__table-state-container'>
          <DataState
            status={DataStateStatus.failed}
            title='Something went wrong'
            description='We couldn’t load your data.'
            onRefresh={() => refetch()}
            isLoading={isValidating || isLoading}
          />
        </div>
      ) : null}

      {(!data || isLoading) && !error ? (
        <div className={`Layer__${COMPONENT_NAME}__loader-container`}>
          <Loader />
        </div>
      ) : null}

      {!isLoading && !error && data?.accounts.length === 0 ? (
        <div className='Layer__table-state-container'>
          <DataState
            status={DataStateStatus.info}
            title='Accounts were not found'
            description='New account can be created with "Add Account".'
            onRefresh={() => refetch()}
            isLoading={isValidating}
          />
        </div>
      ) : null}
    </Panel>
  )
}
