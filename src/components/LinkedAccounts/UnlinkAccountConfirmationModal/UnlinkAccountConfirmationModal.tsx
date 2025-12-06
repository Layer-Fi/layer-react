import { useContext, useMemo } from 'react'

import type { LinkedAccount } from '@internal-types/linked_accounts'
import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'
import { type ModalProps } from '@ui/Modal/Modal'
import { BaseConfirmationModal } from '@components/blocks/BaseConfirmationModal/BaseConfirmationModal'

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
