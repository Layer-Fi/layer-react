import React, { ChangeEvent } from 'react'
import { Header } from '../Container'
import { Tabs } from '../Tabs'
import { Toggle } from '../Toggle'
import { Heading, HeadingSize } from '../Typography'
import { DisplayState, MobileComponentType } from './constants'
import classNames from 'classnames'

export interface BankTransactionsHeaderProps {
  shiftStickyHeader: number
  asWidget?: boolean
  categorizedOnly?: boolean
  display: DisplayState
  onCategorizationDisplayChange: (event: ChangeEvent<HTMLInputElement>) => void
  mobileComponent?: MobileComponentType
  withDatePicker?: boolean
  listView?: boolean
}

export const BankTransactionsHeader = ({
  shiftStickyHeader,
  asWidget,
  categorizedOnly,
  display,
  onCategorizationDisplayChange,
  mobileComponent,
  withDatePicker,
  listView,
}: BankTransactionsHeaderProps) => {
  return (
    <Header
      className={classNames(
        'Layer__bank-transactions__header',
        withDatePicker && 'Layer__bank-transactions__header--with-date-picker',
        mobileComponent && listView
          ? 'Layer__bank-transactions__header--mobile'
          : undefined,
      )}
      style={{ top: shiftStickyHeader }}
    >
      <div className='Layer__bank-transactions__header__content'>
        <Heading
          className='Layer__bank-transactions__title'
          size={asWidget ? HeadingSize.secondary : HeadingSize.secondary}
        >
          Transactions
        </Heading>
        {withDatePicker && <span>Date picker</span>}
      </div>

      {!categorizedOnly && !(mobileComponent == 'mobileList' && listView) && (
        <Toggle
          name='bank-transaction-display'
          options={[
            { label: 'To Review', value: DisplayState.review },
            { label: 'Categorized', value: DisplayState.categorized },
          ]}
          selected={display}
          onChange={onCategorizationDisplayChange}
        />
      )}

      {!categorizedOnly && mobileComponent === 'mobileList' && listView && (
        <Tabs
          name='bank-transaction-display'
          options={[
            { label: 'To Review', value: DisplayState.review },
            { label: 'Categorized', value: DisplayState.categorized },
          ]}
          selected={display}
          onChange={onCategorizationDisplayChange}
        />
      )}
    </Header>
  )
}
