import { useMemo, useState } from 'react'
import type { Key } from 'react-aria-components'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { hasMatch } from '@utils/bankTransactions'
import { VStack } from '@ui/Stack/Stack'
import { Toggle } from '@ui/Toggle/Toggle'
import { BankTransactionsMobileForms } from '@components/BankTransactionsMobileList/BankTransactionsMobileForms'

import { Purpose } from './BankTransactionsMobileListItem'
import { PersonalStableName } from './constants'

const getPurposeToggleOptions = (t: (key: string, defaultValue: string) => string) => [
  {
    value: 'business',
    label: t('business', 'Business'),
    style: { minWidth: 84 },
  },
  {
    value: 'personal',
    label: t('personal', 'Personal'),
    style: { minWidth: 84 },
  },
  {
    value: 'more',
    label: t('more', 'More'),
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
  const { t } = useTranslation()
  const [purpose, setPurpose] = useState<Purpose>(getInitialPurpose(bankTransaction))
  const purposeToggleOptions = useMemo(() => getPurposeToggleOptions(t), [t])

  const onChangePurpose = (key: Key) =>
    setPurpose(key as Purpose)

  return (
    <VStack pi='md' gap='md' pbe='md'>
      {showCategorization
        && (
          <Toggle
            ariaLabel={t('purpose', 'Purpose')}
            options={purposeToggleOptions}
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

const isPersonalCategory = (category: BankTransaction['category']): boolean => {
  if (!category) {
    return false
  }

  if (category.type === 'Account' && 'stable_name' in category) {
    const stableName = category.stable_name
    if (stableName === PersonalStableName.CREDIT || stableName === PersonalStableName.DEBIT) {
      return true
    }
  }

  if (category.type === 'Exclusion') {
    return true
  }

  return false
}

const getInitialPurpose = (bankTransaction: BankTransaction): Purpose => {
  if (bankTransaction.category) {
    if (isPersonalCategory(bankTransaction.category)) {
      return Purpose.personal
    }
    if (bankTransaction.categorization_status === CategorizationStatus.SPLIT) {
      return Purpose.more
    }
    return Purpose.business
  }

  return hasMatch(bankTransaction) ? Purpose.more : Purpose.business
}
