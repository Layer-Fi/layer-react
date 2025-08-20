import { useContext, useMemo } from 'react'
import { DialogModalProps as ModalProps } from '../../ui/Modal/DialogModal'
import { LinkedAccountsContext } from '../../../contexts/LinkedAccountsContext'
import { BaseConfirmationModal } from '../../BaseConfirmationModal/BaseConfirmationModal'
import type { LinkedAccount } from '../../../types/linked_accounts'

type UnlinkAccountConfirmationModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  account: LinkedAccount
}
export function UnlinkAccountConfirmationModal({ isOpen, onOpenChange, account }: UnlinkAccountConfirmationModalProps) {
  const { unlinkAccount } = useContext(LinkedAccountsContext)
  const variant = account.external_account_source === 'CUSTOM' ? 'DELETE' : 'UNLINK'

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
      onConfirm={() => unlinkAccount(account.external_account_source, account.user_created, account.id)}
      confirmLabel={modalContent.confirmLabel}
      errorText={modalContent.errorText}
    />
  )
}
