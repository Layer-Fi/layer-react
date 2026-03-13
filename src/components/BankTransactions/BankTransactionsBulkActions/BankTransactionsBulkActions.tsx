import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DisplayState } from '@internal-types/bankTransactions'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { CategorizationMode } from '@components/BankTransactions/BankTransactionsBulkActions/BankTransactionsCategorizeAllModal'
import { BankTransactionsCategorizeAllModal } from '@components/BankTransactions/BankTransactionsBulkActions/BankTransactionsCategorizeAllModal'
import { BankTransactionsConfirmAllModal } from '@components/BankTransactions/BankTransactionsBulkActions/BankTransactionsConfirmAllModal'
import { BankTransactionsUncategorizeAllModal } from '@components/BankTransactions/BankTransactionsBulkActions/BankTransactionsUncategorizeAllModal'

interface BankTransactionsBulkActionsProps {
  isMobileView?: boolean
  slotProps?: {
    ConfirmAllModal?: {
      label?: string
    }
  }
}

export const BankTransactionsBulkActions = ({
  isMobileView = false,
  slotProps,
}: BankTransactionsBulkActionsProps) => {
  const { t } = useTranslation()
  const { display } = useBankTransactionsContext()
  const [categorizeModalOpen, setCategorizeModalOpen] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [recategorizeModalOpen, setRecategorizeModalOpen] = useState(false)
  const [uncategorizeModalOpen, setUncategorizeModalOpen] = useState(false)
  const confirmButtonLabel = slotProps?.ConfirmAllModal?.label || t('confirmAll', 'Confirm all')

  return (
    <>
      <HStack align='center' gap='xs' justify={isMobileView ? 'end' : undefined}>
        {display === DisplayState.review
          ? (
            <>
              <Button
                variant='outlined'
                onClick={() => setCategorizeModalOpen(true)}
              >
                {t('categorize', 'Categorize')}
              </Button>
              <BankTransactionsCategorizeAllModal
                isOpen={categorizeModalOpen}
                onOpenChange={setCategorizeModalOpen}
                mode={CategorizationMode.Categorize}
                isMobileView={isMobileView}
              />

              <Button variant='solid' onClick={() => setConfirmModalOpen(true)}>
                {confirmButtonLabel}
              </Button>
              <BankTransactionsConfirmAllModal
                isOpen={confirmModalOpen}
                onOpenChange={setConfirmModalOpen}
                isMobileView={isMobileView}
              />
            </>
          )
          : (
            <>
              <Button
                variant='outlined'
                onClick={() => setRecategorizeModalOpen(true)}
              >
                {isMobileView ? t('categorize', 'Categorize') : t('recategorize', 'Recategorize')}
              </Button>
              <BankTransactionsCategorizeAllModal
                isOpen={recategorizeModalOpen}
                onOpenChange={setRecategorizeModalOpen}
                mode={isMobileView ? CategorizationMode.Categorize : CategorizationMode.Recategorize}
                isMobileView={isMobileView}
              />

              <Button
                variant='solid'
                onClick={() => setUncategorizeModalOpen(true)}
              >
                {t('uncategorize', 'Uncategorize')}
              </Button>
              <BankTransactionsUncategorizeAllModal
                isOpen={uncategorizeModalOpen}
                onOpenChange={setUncategorizeModalOpen}
                isMobileView={isMobileView}
              />
            </>
          )}
      </HStack>
    </>
  )
}
