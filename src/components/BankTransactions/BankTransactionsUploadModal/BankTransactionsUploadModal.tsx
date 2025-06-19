import { Modal, ModalProps } from '../../ui/Modal/Modal'
import { ModalCloseButton } from '../../ui/Modal/ModalSlots'
import { UploadTransactions } from '../../UploadTransactions/UploadTransactions'

function BankTransactionsUploadModalContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      <ModalCloseButton onClose={onClose} positionAbsolute />
      <UploadTransactions onComplete={onClose} />
    </>
  )
}

type BankTransactionsUploadModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'>
export function BankTransactionsUploadModal({ isOpen, onOpenChange }: BankTransactionsUploadModalProps) {
  return (
    <Modal flexBlock isOpen={isOpen} onOpenChange={onOpenChange} size='lg' aria-label='Upload transactions'>
      {({ close }) => <BankTransactionsUploadModalContent onClose={close} />}
    </Modal>
  )
}
