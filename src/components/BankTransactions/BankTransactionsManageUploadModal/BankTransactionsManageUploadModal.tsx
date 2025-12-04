import { Modal, type ModalProps } from '@ui/Modal/Modal'
import { ManageUploadTransactions } from '@components/ManageUploadTransactions/ManageUploadTransactions'

type BankTransactionsManageUploadModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'>
export function BankTransactionsManageUploadModal({ isOpen, onOpenChange }: BankTransactionsManageUploadModalProps) {
  return (
    <Modal flexBlock isOpen={isOpen} onOpenChange={onOpenChange} size='lg' aria-label='Manage upload transactions'>
      {({ close }) => {
        return <ManageUploadTransactions onComplete={close} />
      }}
    </Modal>
  )
}
