import { HStack } from '../../ui/Stack/Stack'
import { CategorizationMode } from './BankTransactionsCategorizeAllModal'
import { BankTransactionsCategorizeAllModal } from './BankTransactionsCategorizeAllModal'
import { BankTransactionsConfirmAllModal } from './BankTransactionsConfirmAllModal'
import { BankTransactionsUncategorizeAllModal } from './BankTransactionsUncategorizeAllModal'
import { useBankTransactionsContext } from '../../../contexts/BankTransactionsContext/BankTransactionsContext'
import { DisplayState } from '../../../types/bank_transactions'
import { useState } from 'react'
import { Button } from '../../ui/Button/Button'

export const BankTransactionsBulkActions = () => {
  const { display } = useBankTransactionsContext()
  const [categorizeModalOpen, setCategorizeModalOpen] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [recategorizeModalOpen, setRecategorizeModalOpen] = useState(false)
  const [uncategorizeModalOpen, setUncategorizeModalOpen] = useState(false)

  return (
    <>
      <HStack align='center' gap='xs'>
        {display === DisplayState.review
          ? (
            <>
              <Button
                variant='outlined'
                onClick={() => setCategorizeModalOpen(true)}
              >
                Categorize
              </Button>
              <BankTransactionsCategorizeAllModal
                isOpen={categorizeModalOpen}
                onOpenChange={setCategorizeModalOpen}
                mode={CategorizationMode.Categorize}
              />

              <Button variant='solid' onClick={() => setConfirmModalOpen(true)}>
                Confirm
              </Button>
              <BankTransactionsConfirmAllModal
                isOpen={confirmModalOpen}
                onOpenChange={setConfirmModalOpen}
              />
            </>
          )
          : (
            <>
              <Button
                variant='outlined'
                onClick={() => setRecategorizeModalOpen(true)}
              >
                Recategorize
              </Button>
              <BankTransactionsCategorizeAllModal
                isOpen={recategorizeModalOpen}
                onOpenChange={setRecategorizeModalOpen}
                mode={CategorizationMode.Recategorize}
              />

              <Button
                variant='solid'
                onClick={() => setUncategorizeModalOpen(true)}
              >
                Uncategorize
              </Button>
              <BankTransactionsUncategorizeAllModal
                isOpen={uncategorizeModalOpen}
                onOpenChange={setUncategorizeModalOpen}
              />
            </>
          )}
      </HStack>
    </>
  )
}
