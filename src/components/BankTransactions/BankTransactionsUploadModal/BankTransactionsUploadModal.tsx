import { Modal, ModalProps } from '../../ui/Modal/Modal'
import { ModalContextBar } from '../../ui/Modal/ModalSlots'
import { UploadTransactions } from '../../UploadTransactions/UploadTransactions'

function BankTransactionsUploadModalContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      <ModalContextBar onClose={onClose} />
      <UploadTransactions onComplete={onClose} />
    </>
  )
}

type BankTransactionsUploadModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'>
export function BankTransactionsUploadModal({ isOpen, onOpenChange }: BankTransactionsUploadModalProps) {
  return (
    <Modal flexBlock isOpen={isOpen} onOpenChange={onOpenChange} size='lg'>
      {({ close }) => <BankTransactionsUploadModalContent onClose={close} />}
    </Modal>
  )
}
