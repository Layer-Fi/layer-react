import { useState, type ChangeEvent } from 'react'
import { BankTransaction } from '@internal-types/bank_transactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { Toggle, ToggleSize } from '@components/Toggle/Toggle'
import { BankTransactionMobileForms } from '@components/BankTransactionsMobileList/BankTransactionsMobileForms'
import { hasMatch } from '@utils/bankTransactions'
import { Purpose } from './BankTransactionsMobileListItem'
import { HStack, VStack } from '@components/ui/Stack/Stack'
import './bankTransactionsMobileListItemExpandedRow.scss'

export interface BankTransactionsMobileListItemExpandedRowProps {
  bankTransaction: BankTransaction
  showCategorization?: boolean
  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean
}

export const BankTransactionsMobileListItemExpandedRow = ({
  bankTransaction,
  showCategorization,
  showDescriptions,
  showReceiptUploads,
  showTooltips,
}: BankTransactionsMobileListItemExpandedRowProps) => {
  const [purpose, setPurpose] = useState<Purpose>(getInitialPurpose(bankTransaction))

  const onChangePurpose = (event: ChangeEvent<HTMLInputElement>) =>
    setPurpose(event.target.value as Purpose)

  return (
    <div className='Layer__bank-transaction-mobile-list-item__expanded-row'>
      <VStack pb='md' justify='space-between' align='center'>
        {showCategorization
          ? (
            <HStack align='center' justify='space-between'>
              <Toggle
                name={`purpose-${bankTransaction.id}`}
                size={ToggleSize.medium}
                options={[
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
                ]}
                selected={purpose}
                onChange={onChangePurpose}
              />
            </HStack>
          )
          : null}
        <BankTransactionMobileForms
          purpose={purpose}
          bankTransaction={bankTransaction}
          showCategorization={showCategorization}
          showDescriptions={showDescriptions}
          showReceiptUploads={showReceiptUploads}
          showTooltips={showTooltips}
        />
      </VStack>
    </div>
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
