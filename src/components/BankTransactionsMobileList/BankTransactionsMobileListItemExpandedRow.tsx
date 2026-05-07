import { useMemo, useState } from 'react'
import type { Key } from 'react-aria-components'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { hasMatch } from '@utils/bankTransactions/shared'
import { translationKey } from '@utils/i18n/translationKey'
import type { BankTransactionCategorization } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import {
  BankTransactionSelectionVariant,
  DEFAULT_CATEGORIZATION,
  useBankTransactionsCategorizationActions,
  useGetBankTransactionCategorizationByTransactionId,
} from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { Toggle } from '@ui/Toggle/Toggle'
import { isSplitAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { BankTransactionsMobileForms } from '@components/BankTransactionsMobileList/BankTransactionsMobileForms'

import { Purpose } from './BankTransactionsMobileListItem'

const PURPOSE_TOGGLE_CONFIG = [
  { value: 'business' as const, ...translationKey('common:label.business', 'Business'), style: { minWidth: 84 } },
  { value: 'personal' as const, ...translationKey('common:label.personal', 'Personal'), style: { minWidth: 84 } },
  { value: 'more' as const, ...translationKey('common:label.more', 'More'), style: { minWidth: 84 } },
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
  const selectedCategorization = useGetBankTransactionCategorizationByTransactionId(bankTransaction.id)
  const { setTransactionSelectionVariant } = useBankTransactionsCategorizationActions()

  const [purpose, setPurpose] = useState(getPurposeFromStore(selectedCategorization))

  const purposeToggleOptions = useMemo(
    () => PURPOSE_TOGGLE_CONFIG.map(opt => ({
      ...opt,
      label: t(opt.i18nKey, opt.defaultValue),
    })),
    [t],
  )

  const onChangePurpose = (key: Key) => {
    const nextPurpose = key as Purpose
    const isCurrentlySplit = !!selectedCategorization?.category && isSplitAsOption(selectedCategorization.category)

    const nextVariant = nextPurpose === Purpose.more
      && hasMatch(bankTransaction)
      && !isCurrentlySplit
      ? BankTransactionSelectionVariant.MATCH
      : BankTransactionSelectionVariant.CATEGORY

    setTransactionSelectionVariant(bankTransaction.id, nextVariant)
    setPurpose(nextPurpose)
  }

  return (
    <VStack pi='md' gap='md' pbe='md'>
      {showCategorization
        && (
          <Toggle
            ariaLabel={t('common:label.purpose', 'Purpose')}
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

const getPurposeFromStore = (selectedCategorization: BankTransactionCategorization | undefined): Purpose => {
  const effectiveCategorization = selectedCategorization ?? DEFAULT_CATEGORIZATION

  if (effectiveCategorization.variant === BankTransactionSelectionVariant.MATCH) {
    return Purpose.more
  }

  if (effectiveCategorization.category === null) {
    return Purpose.business
  }

  if (isSplitAsOption(effectiveCategorization.category)) {
    return Purpose.more
  }

  return Purpose.business
}
