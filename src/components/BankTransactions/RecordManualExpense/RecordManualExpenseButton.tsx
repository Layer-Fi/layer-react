import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@ui/Button/Button'
import { RecordManualExpenseModal } from '@components/BankTransactions/RecordManualExpense/RecordManualExpenseModal'

type RecordManualExpenseButtonProps = {
  isDisabled?: boolean
}

export function RecordManualExpenseButton({ isDisabled }: RecordManualExpenseButtonProps) {
  const { t } = useTranslation()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button
        icon
        variant='outlined'
        isDisabled={isDisabled}
        onPress={() => setIsModalOpen(true)}
        aria-label={t('bankTransactions:action.record_expense', 'Record expense')}
      >
        <Plus size={14} />
      </Button>
      {isModalOpen && <RecordManualExpenseModal isOpen onOpenChange={setIsModalOpen} />}
    </>
  )
}
