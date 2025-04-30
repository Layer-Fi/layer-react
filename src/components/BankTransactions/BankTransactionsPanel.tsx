import { createContext, ReactNode, RefObject, useContext, useState } from 'react'
import { Panel } from '../Panel/Panel'
import { CategoryForm } from './CategoryForm/CategoryForm'

type BankTransactionsPanelProps = {
  containerRef: RefObject<HTMLDivElement>
  children: ReactNode
}

function useBankTransactionsPanel() {
  const [isOpen, setOpen] = useState(false)

  const openCategoryForm = () => {
    /** @TODO - should this function be disabled when bookkeeping is active? */
    setOpen(true)
  }

  const closeCategoryForm = () => {
    setOpen(false)
  }

  return {
    isOpen,
    openCategoryForm,
    closeCategoryForm,
  }
}

const BankTransactionsPanelContext = createContext<ReturnType<typeof useBankTransactionsPanel>>({
  isOpen: false,
  openCategoryForm: () => {},
  closeCategoryForm: () => {},
})

export const useBankTransactionsPanelContext = () => useContext(BankTransactionsPanelContext)

function InternalBankTransactionsPanel({ children, containerRef }: BankTransactionsPanelProps) {
  const { isOpen } = useBankTransactionsPanelContext()

  return (
    <Panel
      parentRef={containerRef}
      sidebar={<CategoryForm />}
      sidebarIsOpen={isOpen}
    >
      {children}
    </Panel>
  )
}

export function BankTransactionsPanel(props: BankTransactionsPanelProps) {
  const contextData = useBankTransactionsPanel()

  return (
    <BankTransactionsPanelContext.Provider value={contextData}>
      <InternalBankTransactionsPanel {...props} />
    </BankTransactionsPanelContext.Provider>
  )
}
