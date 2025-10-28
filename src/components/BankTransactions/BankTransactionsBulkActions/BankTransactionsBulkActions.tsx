import { HStack } from '../../ui/Stack/Stack'
import { BankTransactionsConfirmAllButton } from './BankTransactionsConfirmAllButton'
import { BankTransactionsCategorizeAllButton, CategorizationMode } from './BankTransactionsCategorizeAllButton'
import { BankTransactionsUncategorizeAllButton } from './BankTransactionsUncategorizeAllButton'
import { BankTransactionsCategorizeAllModal } from './BankTransactionsCategorizeAllModal'
import { BankTransactionsConfirmAllModal } from './BankTransactionsConfirmAllModal'
import { BankTransactionsUncategorizeAllModal } from './BankTransactionsUncategorizeAllModal'
import { useBankTransactionsContext } from '../../../contexts/BankTransactionsContext'
import { DisplayState } from '../../../types/bank_transactions'
import { useState } from 'react'

export const BankTransactionsBulkActions = () => {
  const { display } = useBankTransactionsContext()
  const [categorizeModalOpen, setCategorizeModalOpen] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [uncategorizeModalOpen, setUncategorizeModalOpen] = useState(false)

  return (
    <>
      <HStack pis='3xl' align='center' gap='sm'>
        {display === DisplayState.review
          ? (
            <>
              <BankTransactionsCategorizeAllButton
                onClick={() => setCategorizeModalOpen(true)}
                mode={CategorizationMode.Categorize}
              />
              <BankTransactionsConfirmAllButton
                onClick={() => setConfirmModalOpen(true)}
              />
            </>
          )
          : (
            <>
              <BankTransactionsCategorizeAllButton
                onClick={() => setCategorizeModalOpen(true)}
                mode={CategorizationMode.Recategorize}
              />
              <BankTransactionsUncategorizeAllButton
                onClick={() => setUncategorizeModalOpen(true)}
              />
            </>
          )}
      </HStack>

      <BankTransactionsCategorizeAllModal
        isOpen={categorizeModalOpen}
        onOpenChange={setCategorizeModalOpen}
        mode={display === DisplayState.review ? CategorizationMode.Categorize : CategorizationMode.Recategorize}
      />
      <BankTransactionsConfirmAllModal
        isOpen={confirmModalOpen}
        onOpenChange={setConfirmModalOpen}
      />
      <BankTransactionsUncategorizeAllModal
        isOpen={uncategorizeModalOpen}
        onOpenChange={setUncategorizeModalOpen}
      />
    </>
  )
}
