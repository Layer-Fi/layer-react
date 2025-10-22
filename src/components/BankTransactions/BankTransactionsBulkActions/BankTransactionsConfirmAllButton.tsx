import { BaseConfirmationModal } from '../../BaseConfirmationModal/BaseConfirmationModal'
import { Span } from '../../ui/Typography/Text'
import { Button } from '../../ui/Button/Button'
import { useCallback, useState } from 'react'
import pluralize from 'pluralize'
import { useCountSelectedIds } from '../../../providers/BulkSelectionStore/BulkSelectionStoreProvider'

export const BankTransactionsConfirmAllButton = () => {
  const { count } = useCountSelectedIds()
  const [isConfirmAllModalOpen, setIsConfirmAllModalOpen] = useState(false)

  const handleConfirmAllClick = useCallback(() => {
    setIsConfirmAllModalOpen(true)
  }, [])

  return (
    <>
      <Button
        variant='solid'
        onClick={handleConfirmAllClick}
      >
        Confirm all
      </Button>
      <BaseConfirmationModal
        isOpen={isConfirmAllModalOpen}
        onOpenChange={setIsConfirmAllModalOpen}
        title='Confirm all suggestions?'
        content={(
          <Span>
            {`This action will confirm ${count} selected ${pluralize('transaction', count)}.`}
          </Span>
        )}
        onConfirm={() => {}}
        confirmLabel='Confirm All'
        cancelLabel='Cancel'
        closeOnConfirm
      />
    </>
  )
}
