import { useState } from 'react'

import { DisplayState } from '@internal-types/bank_transactions'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { CategorizationMode } from '@components/BankTransactions/BankTransactionsBulkActions/BankTransactionsCategorizeAllModal'
import { BankTransactionsCategorizeAllModal } from '@components/BankTransactions/BankTransactionsBulkActions/BankTransactionsCategorizeAllModal'
import { BankTransactionsConfirmAllModal } from '@components/BankTransactions/BankTransactionsBulkActions/BankTransactionsConfirmAllModal'
import { BankTransactionsUncategorizeAllModal } from '@components/BankTransactions/BankTransactionsBulkActions/BankTransactionsUncategorizeAllModal'

export const BankTransactionsBulkActions = ({ useCategorySelectDrawer = false }: { useCategorySelectDrawer?: boolean }) => {
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
                useCategorySelectDrawer={useCategorySelectDrawer}
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
                useCategorySelectDrawer={useCategorySelectDrawer}
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
