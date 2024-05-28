import React, { ChangeEvent } from 'react'
import { Header } from '../Container'
import { Toggle } from '../Toggle'
import { Heading, HeadingSize } from '../Typography'
import { DisplayState, MobileVariant } from './constants'

export interface BankTransactionsHeaderProps {
  shiftStickyHeader: number
  asWidget?: boolean
  categorizedOnly?: boolean
  display: DisplayState
  onCategorizationDisplayChange: (event: ChangeEvent<HTMLInputElement>) => void
  mobileVariant?: MobileVariant
  withDatePicker?: boolean
  listView?: boolean
}

export const BankTransactionsHeader = ({
  shiftStickyHeader,
  asWidget,
  categorizedOnly,
  display,
  onCategorizationDisplayChange,
  mobileVariant,
  withDatePicker,
  listView,
}: BankTransactionsHeaderProps) => {
  return (
    <Header
      className='Layer__bank-transactions__header'
      style={{ top: shiftStickyHeader }}
    >
      <div>
        <Heading
          className='Layer__bank-transactions__title'
          size={asWidget ? HeadingSize.secondary : HeadingSize.secondary}
        >
          Transactions
        </Heading>
        {withDatePicker && <span>Date picker</span>}
      </div>
      {!categorizedOnly && (
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
    </Header>
  )
}
