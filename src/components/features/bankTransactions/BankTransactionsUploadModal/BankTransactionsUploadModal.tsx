import { useTranslation } from 'react-i18next'

import { Modal, type ModalProps } from '@ui/Modal/Modal'
import { BankTransactionsUploadWizard } from '@features/bankTransactions/BankTransactionsUploadModal/BankTransactionsUploadWizard'

type BankTransactionsUploadModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'>
export function BankTransactionsUploadModal({ isOpen, onOpenChange }: BankTransactionsUploadModalProps) {
  const { t } = useTranslation()
  return (
    <Modal flexBlock isOpen={isOpen} onOpenChange={onOpenChange} size='xl' aria-label={t('upload:action.upload_transactions', 'Upload transactions')}>
      {({ close }) => {
        return <BankTransactionsUploadWizard onComplete={close} />
      }}
    </Modal>
  )
}
