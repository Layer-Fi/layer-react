import { type Key, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/features/bankTransactions/bankTransaction'
import { isSplitAsOption } from '@internal-types/features/categorization/bankTransactionCategoryComboBoxOption'
import { hasMatch } from '@utils/features/bankTransactions/shared'
import { translationKey } from '@utils/shared/i18n/translationKey'
import {
  BankTransactionSelectionVariant,
  useBankTransactionsCategorizationActions,
} from '@providers/features/categorization/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { useBankTransactionsIsCategorizationEnabledContext } from '@providers/features/categorization/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { useGetBankTransactionCategorizationWithDefault } from '@hooks/features/bankTransactions/useGetBankTransactionCategorizationWithDefault'
import { useIsEditableCustomBankTransaction } from '@hooks/features/bankTransactions/useIsEditableCustomBankTransaction'
import { VStack } from '@ui/Stack/Stack'
import { Toggle } from '@ui/Toggle/Toggle'
import { BankTransactionsMobileForms } from '@features/bankTransactions/BankTransactionsMobileList/BankTransactionsMobileForms'
import { getPurposeFromStore, Purpose } from '@features/bankTransactions/BankTransactionsMobileList/purpose'
import { EditCustomBankTransactionButton } from '@features/bankTransactions/EditCustomBankTransactionButton/EditCustomBankTransactionButton'

const PURPOSE_TOGGLE_CONFIG = [
  { value: 'business' as const, ...translationKey('common:label.business', 'Business'), style: { minWidth: 84 } },
  { value: 'personal' as const, ...translationKey('common:label.personal', 'Personal'), style: { minWidth: 84 } },
  { value: 'more' as const, ...translationKey('common:label.more', 'More'), style: { minWidth: 84 } },
]

export interface BankTransactionsMobileListItemExpandedRowProps {
  bankTransaction: BankTransaction
  isOpen?: boolean
}

export const BankTransactionsMobileListItemExpandedRow = ({
  bankTransaction,
  isOpen,
}: BankTransactionsMobileListItemExpandedRowProps) => {
  const { t } = useTranslation()
  const selectedCategorization = useGetBankTransactionCategorizationWithDefault(bankTransaction)
  const { setTransactionSelectionVariant } = useBankTransactionsCategorizationActions()
  const showCategorization = useBankTransactionsIsCategorizationEnabledContext()
  const isEditable = useIsEditableCustomBankTransaction(bankTransaction)

  const [purpose, setPurpose] = useState(() => getPurposeFromStore(selectedCategorization))

  const purposeToggleOptions = useMemo(
    () => PURPOSE_TOGGLE_CONFIG.map(opt => ({
      ...opt,
      label: t(opt.i18nKey, opt.defaultValue),
    })),
    [t],
  )

  const onChangePurpose = useCallback((key: Key) => {
    const nextPurpose = key as Purpose
    const isCurrentlySplit = !!selectedCategorization?.category && isSplitAsOption(selectedCategorization.category)

    const nextVariant = nextPurpose === Purpose.more
      && hasMatch(bankTransaction)
      && !isCurrentlySplit
      ? BankTransactionSelectionVariant.MATCH
      : BankTransactionSelectionVariant.CATEGORY

    setTransactionSelectionVariant(bankTransaction.id, nextVariant)
    setPurpose(nextPurpose)
  }, [bankTransaction, selectedCategorization.category, setTransactionSelectionVariant])

  return (
    <VStack pi='sm' gap='md' pbs='4xs' pbe='sm'>
      {showCategorization && (
        <Toggle
          ariaLabel={t('common:label.purpose', 'Purpose')}
          options={purposeToggleOptions}
          selectedKey={purpose}
          onSelectionChange={onChangePurpose}
        />
      )}
      <VStack gap='xs'>
        <BankTransactionsMobileForms
          isOpen={isOpen}
          purpose={purpose}
          bankTransaction={bankTransaction}
          showCategorization={showCategorization}
        />
        {isEditable && <EditCustomBankTransactionButton bankTransaction={bankTransaction} withLabel />}
      </VStack>
    </VStack>

  )
}
