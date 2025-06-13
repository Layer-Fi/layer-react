import { useContext } from 'react'
import { ModalProps } from '../../ui/Modal/Modal'
import { LinkedAccountsContext } from '../../../contexts/LinkedAccountsContext'
import { BaseConfirmationModal } from '../../BaseConfirmationModal/BaseConfirmationModal'

type UnlinkAccountConfirmationModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  accountId: string
}
export function UnlinkAccountConfirmationModal({ isOpen, onOpenChange, accountId }: UnlinkAccountConfirmationModalProps) {
  const { unlinkAccount } = useContext(LinkedAccountsContext)

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title='Unlink account'
      description='This account will stop syncing new data, and any unmatched transactions will be permanently deleted.'
      onConfirm={() => unlinkAccount(accountId)}
      confirmLabel='Unlink Account'
      errorText='Unlink failed. Please check your connection and try again in a few seconds.'
    />
  )
}
