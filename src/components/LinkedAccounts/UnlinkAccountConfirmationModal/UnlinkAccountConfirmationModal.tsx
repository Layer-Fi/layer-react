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
          title: t('linkedAccounts.deleteAccount', 'Delete account'),
          description: t('linkedAccounts.thisAccountAndAnyUnmatchedTransactionsWillBeDeleted', 'This account and any unmatched transactions will be deleted.'),
          confirmLabel: t('linkedAccounts.deleteAccountButtonLabel', 'Delete Account'),
          errorText: t('linkedAccounts.deletionFailedPleaseCheckYourConnectionAndTryAgainInAFewSeconds', 'Deletion failed. Please check your connection and try again in a few seconds.'),
        }
      case 'UNLINK':
        return {
          title: t('linkedAccounts.unlinkAccount', 'Unlink account'),
          description:
            t('linkedAccounts.thisAccountWillStopSyncingNewDataAndAnyUnmatchedTransactionsWillBeDeleted', 'This account will stop syncing new data, and any unmatched transactions will be deleted.'),
          confirmLabel: t('linkedAccounts.unlinkAccountButtonLabel', 'Unlink Account'),
          errorText: t('linkedAccounts.unlinkFailedPleaseCheckYourConnectionAndTryAgainInAFewSeconds', 'Unlink failed. Please check your connection and try again in a few seconds.'),
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
