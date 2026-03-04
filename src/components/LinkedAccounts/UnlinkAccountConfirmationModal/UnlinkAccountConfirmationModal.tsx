import { useContext, useMemo } from 'react'

import type { BankAccount } from '@internal-types/linked_accounts'
import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'
import { type ModalProps } from '@ui/Modal/Modal'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'

type UnlinkAccountConfirmationModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  bankAccount: BankAccount
}
export function UnlinkAccountConfirmationModal({ isOpen, onOpenChange, bankAccount }: UnlinkAccountConfirmationModalProps) {
  const { unlinkBankAccount } = useContext(LinkedAccountsContext)
  const hasUserCreatedCustomAccount = bankAccount.external_accounts.some(
    ea => ea.external_account_source === 'CUSTOM' && ea.user_created,
  )
  const variant = hasUserCreatedCustomAccount ? 'DELETE' : 'UNLINK'

  const modalContent = useMemo(() => {
    switch (variant) {
      case 'DELETE':
        return {
          title: 'Delete account',
          description: 'This account and any unmatched transactions will be deleted.',
          confirmLabel: 'Delete Account',
          errorText: 'Deletion failed. Please check your connection and try again in a few seconds.',
        }
      case 'UNLINK':
        return {
          title: 'Unlink account',
          description:
            'This account will stop syncing new data, and any unmatched transactions will be deleted.',
          confirmLabel: 'Unlink Account',
          errorText: 'Unlink failed. Please check your connection and try again in a few seconds.',
        }
    }
  }, [variant])

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
