import { Modal, type ModalProps } from '@ui/Modal/Modal'
import { UploadTransactions } from '@components/UploadTransactions/UploadTransactions'

type BankTransactionsUploadModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'>
export function BankTransactionsUploadModal({ isOpen, onOpenChange }: BankTransactionsUploadModalProps) {
  return (
    <Modal flexBlock isOpen={isOpen} onOpenChange={onOpenChange} size='lg' aria-label='Upload transactions'>
      {({ close }) => {
        return <UploadTransactions onComplete={close} />
      }}
    </Modal>
  )
}
