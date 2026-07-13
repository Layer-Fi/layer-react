import { useTranslation } from 'react-i18next'

import { Modal, type ModalProps } from '@ui/Modal/Modal'
import { ModalContent, ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { VStack } from '@ui/Stack/Stack'
import { P } from '@ui/Typography/Text'

type RecordManualExpenseModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'>

export function RecordManualExpenseModal({ isOpen, onOpenChange }: RecordManualExpenseModalProps) {
  const { t } = useTranslation()

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size='md'
      aria-label={t('bankTransactions:action.record_expense', 'Record expense')}
    >
      {({ close }) => (
        <VStack>
          <ModalTitleWithClose
            heading={<ModalHeading size='lg'>{t('bankTransactions:action.record_expense', 'Record expense')}</ModalHeading>}
            onClose={close}
          />
          <ModalContent>
            <P>{t('bankTransactions:label.record_expense_coming_soon', 'Manually recording expenses is coming soon.')}</P>
          </ModalContent>
        </VStack>
      )}
    </Modal>
  )
}
