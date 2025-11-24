import { useState } from 'react'
import type { Key } from 'react-aria-components'

import { type BankTransaction } from '@internal-types/bank_transactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { hasMatch } from '@utils/bankTransactions'
import { VStack } from '@ui/Stack/Stack'
import { BankTransactionsMobileForms } from '@components/BankTransactionsMobileList/BankTransactionsMobileForms'
import { Toggle, ToggleSize } from '@components/Toggle/Toggle'

import { Purpose } from './BankTransactionsMobileListItem'

const PURPOSE_TOGGLE_OPTIONS = [
  {
    value: 'business',
    label: 'Business',
    style: { minWidth: 84 },
  },
  {
    value: 'personal',
    label: 'Personal',
    style: { minWidth: 84 },
  },
  {
    value: 'more',
    label: 'More',
    style: { minWidth: 84 },
  },
]

export interface BankTransactionsMobileListItemExpandedRowProps {
  bankTransaction: BankTransaction
  isOpen?: boolean
  showCategorization?: boolean
  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean
}

export const BankTransactionsMobileListItemExpandedRow = ({
  bankTransaction,
  isOpen,
  showCategorization,
  showDescriptions,
  showReceiptUploads,
  showTooltips,
}: BankTransactionsMobileListItemExpandedRowProps) => {
  const [purpose, setPurpose] = useState<Purpose>(getInitialPurpose(bankTransaction))

  const onChangePurpose = (key: Key) =>
    setPurpose(key as Purpose)

  return (
    <VStack pi='md' gap='md' pbe='md'>
      {showCategorization
        && (
          <Toggle
            size={ToggleSize.medium}
            options={PURPOSE_TOGGLE_OPTIONS}
            selectedKey={purpose}
            onSelectionChange={onChangePurpose}
          />
        )}
      <BankTransactionsMobileForms
        isOpen={isOpen}
        purpose={purpose}
        bankTransaction={bankTransaction}
        showCategorization={showCategorization}
        showDescriptions={showDescriptions}
        showReceiptUploads={showReceiptUploads}
        showTooltips={showTooltips}
      />
    </VStack>

  )
}

const getInitialPurpose = (bankTransaction: BankTransaction): Purpose => {
  if (bankTransaction.category) {
    if (bankTransaction.category.type === 'Exclusion') {
      return Purpose.personal
    }
    if (bankTransaction.categorization_status === CategorizationStatus.SPLIT) {
      return Purpose.more
    }
    return Purpose.business
  }

  return hasMatch(bankTransaction) ? Purpose.more : Purpose.business
}
