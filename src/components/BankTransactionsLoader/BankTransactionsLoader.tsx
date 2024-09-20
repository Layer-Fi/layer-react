import React from 'react'
import ChevronDownFill from '../../icons/ChevronDownFill'
import { BankTransaction } from '../../types'
import { IconButton, SubmitButton } from '../Button'
import { SubmitAction } from '../Button/SubmitButton'
import { CategorySelect } from '../CategorySelect'
import { SkeletonTableLoader } from '../SkeletonTableLoader'

export const BankTransactionsLoader = ({
  isLoading = true,
  showTooltips
}: {
  isLoading: boolean
  showTooltips: boolean
}) => {
  const inactiveBankTransactionsActions = (
    <div className='Layer__bank-transaction-row__actions-container Layer__bank-transaction-row__actions-disabled'>
      <CategorySelect
        name='category-bakn-transaction'
        bankTransaction={{} as BankTransaction}
        value={undefined}
        onChange={() => {}}
        disabled={true}
        showTooltips={showTooltips}
      />
      <SubmitButton
        onClick={() => {}}
        action={SubmitAction.UPDATE}
        className='Layer__bank-transaction__submit-btn'
        disabled={true}
      >
        Approve
      </SubmitButton>
      <IconButton
        disabled={true}
        onClick={() => {}}
        className='Layer__bank-transaction-row__expand-button'
        icon={
          <ChevronDownFill className='Layer__chevron Layer__chevron__down' />
        }
      />
    </div>
  )
  return (
    <SkeletonTableLoader
      rows={6}
      cols={
        isLoading
          ? [
              { colSpan: 4, trimLastXRows: 3 },
              { colSpan: 1, parts: 2 },
            ]
          : [
              { colSpan: 4 },
              { colSpan: 1, colComponent: inactiveBankTransactionsActions },
            ]
      }
      height={20}
    />
  )
}
