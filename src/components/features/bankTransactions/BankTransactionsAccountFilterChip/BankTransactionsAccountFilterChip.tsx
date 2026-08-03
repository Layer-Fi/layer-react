import classNames from 'classnames'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useBankAccountFilterActions, useIsBankAccountFilterLocked, useSelectedBankAccountIds } from '@providers/BankAccountsFilterStore/BankAccountsFilterStoreProvider'
import { Badge, BadgeSize, BadgeVariant } from '@ui/Badge/Badge'

import './bankTransactionsAccountFilterChip.scss'

const CLASS_NAME = 'Layer__bank-transactions__selected-accounts-chip'

type BankTransactionsAccountFilterChipProps = {
  slot?: string
  variant: 'wide' | 'compact'
}

export function BankTransactionsAccountFilterChip({ slot, variant }: BankTransactionsAccountFilterChipProps) {
  const { t } = useTranslation()
  const selectedBankAccountIds = useSelectedBankAccountIds()
  const isFilterLocked = useIsBankAccountFilterLocked()
  const { setSelectedBankAccountIds } = useBankAccountFilterActions()

  if (selectedBankAccountIds.length === 0 || isFilterLocked) return null

  return (
    <span slot={slot} className={classNames(CLASS_NAME, `${CLASS_NAME}--${variant}`)}>
      <Badge
        variant={BadgeVariant.INFO}
        size={BadgeSize.MEDIUM}
        icon={<X size={12} />}
        iconPosition='right'
        onClick={() => setSelectedBankAccountIds([])}
      >
        {t('bankTransactions:label.accounts_selected', {
          count: selectedBankAccountIds.length,
          defaultValue_one: '{{count}} account selected',
          defaultValue_other: '{{count}} accounts selected',
        })}
      </Badge>
    </span>
  )
}
