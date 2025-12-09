import { useState } from 'react'

import { DisplayState } from '@internal-types/bank_transactions'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { CategorizationMode } from '@components/BankTransactions/BankTransactionsBulkActions/BankTransactionsCategorizeAllModal'
import { BankTransactionsCategorizeAllModal } from '@components/BankTransactions/BankTransactionsBulkActions/BankTransactionsCategorizeAllModal'
import { BankTransactionsConfirmAllModal } from '@components/BankTransactions/BankTransactionsBulkActions/BankTransactionsConfirmAllModal'
import { BankTransactionsUncategorizeAllModal } from '@components/BankTransactions/BankTransactionsBulkActions/BankTransactionsUncategorizeAllModal'

interface BankTransactionsBulkActionsProps {
  useCategorySelectDrawer?: boolean
  slotProps?: {
    ConfirmAllModal?: {
      label?: string
    }
  }
}

export const BankTransactionsBulkActions = ({
  useCategorySelectDrawer = false,
  slotProps,
}: BankTransactionsBulkActionsProps) => {
  const { display } = useBankTransactionsContext()
  const [categorizeModalOpen, setCategorizeModalOpen] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [recategorizeModalOpen, setRecategorizeModalOpen] = useState(false)
  const [uncategorizeModalOpen, setUncategorizeModalOpen] = useState(false)
  const confirmButtonLabel = slotProps?.ConfirmAllModal?.label || 'Confirm all'

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
                {confirmButtonLabel}
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
