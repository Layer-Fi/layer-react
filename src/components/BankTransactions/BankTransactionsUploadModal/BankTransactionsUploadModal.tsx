import { Modal, ModalProps } from '../../ui/Modal/Modal'
import { UploadTransactions } from '../../UploadTransactions/UploadTransactions'

function BankTransactionsUploadModalContent({ onClose }: { onClose: () => void }) {
  return <UploadTransactions onComplete={onClose} />
}

type BankTransactionsUploadModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'>
export function BankTransactionsUploadModal({ isOpen, onOpenChange }: BankTransactionsUploadModalProps) {
  return (
    <Modal flexBlock isOpen={isOpen} onOpenChange={onOpenChange} size='lg' aria-label='Upload transactions'>
      {({ close }) => {
        return <BankTransactionsUploadModalContent onClose={close} />
      }}
    </Modal>
  )
}
