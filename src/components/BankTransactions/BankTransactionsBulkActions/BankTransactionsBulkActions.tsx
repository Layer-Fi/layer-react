import { HStack } from '../../ui/Stack/Stack'
import { CategorizationMode } from './BankTransactionsCategorizeAllModal'
import { BankTransactionsCategorizeAllModal } from './BankTransactionsCategorizeAllModal'
import { BankTransactionsConfirmAllModal } from './BankTransactionsConfirmAllModal'
import { BankTransactionsUncategorizeAllModal } from './BankTransactionsUncategorizeAllModal'
import { useBankTransactionsContext } from '../../../contexts/BankTransactionsContext'
import { DisplayState } from '../../../types/bank_transactions'
import { useState } from 'react'
import { Button } from '../../ui/Button/Button'

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
              <Button
                variant='outlined'
                onClick={() => setCategorizeModalOpen(true)}
              >
                Set category
              </Button>
              <BankTransactionsCategorizeAllModal
                isOpen={categorizeModalOpen}
                onOpenChange={setCategorizeModalOpen}
                mode={CategorizationMode.Categorize}
              />

              <Button variant='solid' onClick={() => setConfirmModalOpen(true)}>
                Confirm all
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
                onClick={() => setCategorizeModalOpen(true)}
              >
                Recategorize all
              </Button>
              <BankTransactionsCategorizeAllModal
                isOpen={categorizeModalOpen}
                onOpenChange={setCategorizeModalOpen}
                mode={CategorizationMode.Recategorize}
              />

              <Button
                variant='solid'
                onClick={() => setUncategorizeModalOpen(true)}
              >
                Uncategorize all
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
