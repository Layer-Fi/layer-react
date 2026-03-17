import { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { BankAccount } from '@internal-types/linkedAccounts'
import { isAllExternalAccountsUserCreatedCustom } from '@utils/bankAccount'
import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'
import { type ModalProps } from '@ui/Modal/Modal'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'

type UnlinkAccountConfirmationModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  bankAccount: BankAccount
}
export function UnlinkAccountConfirmationModal({ isOpen, onOpenChange, bankAccount }: UnlinkAccountConfirmationModalProps) {
  const { t } = useTranslation()
  const { unlinkBankAccount } = useContext(LinkedAccountsContext)
  const variant = isAllExternalAccountsUserCreatedCustom(bankAccount) ? 'DELETE' : 'UNLINK'

  const modalContent = useMemo(() => {
    switch (variant) {
      case 'DELETE':
        return {
          title: t('linkedAccounts:action.delete_account', 'Delete account'),
          description: t('linkedAccounts:label.account_and_unmatched_transactions_deleted', 'This account and any unmatched transactions will be deleted.'),
          confirmLabel: t('linkedAccounts:action.delete_account_label', 'Delete Account'),
          errorText: t('linkedAccounts:error.delete_account_check_connection', 'Deletion failed. Please check your connection and try again in a few seconds.'),
        }
      case 'UNLINK':
        return {
          title: t('linkedAccounts:action.unlink_account', 'Unlink account'),
          description:
            t('linkedAccounts:label.account_stops_syncing_new_data', 'This account will stop syncing new data, and any unmatched transactions will be deleted.'),
          confirmLabel: t('linkedAccounts:action.unlink_account_label', 'Unlink Account'),
          errorText: t('linkedAccounts:error.unlink_failed', 'Unlink failed. Please check your connection and try again in a few seconds.'),
        }
    }
  }, [variant, t])

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={modalContent.title}
      description={modalContent.description}
      onConfirm={() => unlinkBankAccount(bankAccount.id)}
      confirmLabel={modalContent.confirmLabel}
      errorText={modalContent.errorText}
    />
  )
}
