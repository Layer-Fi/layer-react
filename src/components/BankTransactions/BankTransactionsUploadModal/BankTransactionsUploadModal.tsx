import { useTranslation } from 'react-i18next'

import { Modal, type ModalProps } from '@ui/Modal/Modal'
import { UploadTransactions } from '@components/UploadTransactions/UploadTransactions'

type BankTransactionsUploadModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'>
export function BankTransactionsUploadModal({ isOpen, onOpenChange }: BankTransactionsUploadModalProps) {
  const { t } = useTranslation()
  return (
    <Modal flexBlock isOpen={isOpen} onOpenChange={onOpenChange} size='xl' aria-label={t('upload:uploadTransactions', 'Upload transactions')}>
      {({ close }) => {
        return <UploadTransactions onComplete={close} />
      }}
    </Modal>
  )
}
