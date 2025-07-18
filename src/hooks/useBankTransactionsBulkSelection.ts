import { useState } from 'react'
import { BankTransaction } from '../types'

export const useBankTransactionsBulkSelection = () => {
  const [selectedTransactions, setSelectedTransactions] = useState<BankTransaction[]>([])
  const [bulkSelectionActive, setBulkSelectionActive] = useState(false)

  const addTransaction = (transaction: BankTransaction) => {
    // Ignore duplicated transactions
    if (selectedTransactions.find(t => t.id === transaction.id)) {
      return
    }
    setSelectedTransactions(prev => [...prev, transaction])
  }

  const removeTransaction = (transaction: BankTransaction) => {
    setSelectedTransactions(prev => prev.filter(t => t.id !== transaction.id))
  }

  const clearSelection = () => {
    setSelectedTransactions([])
  }

  const toggleTransaction = (transaction: BankTransaction) => {
    const isSelected = selectedTransactions.find(t => t.id === transaction.id)
    if (isSelected) {
      removeTransaction(transaction)
    } else {
      addTransaction(transaction)
    }
  }

  const selectAll = (transactions: BankTransaction[]) => {
    // For current page selection, add to existing selection rather than replacing
    const newSelections = transactions.filter(t => 
      !selectedTransactions.some(selected => selected.id === t.id)
    )
    setSelectedTransactions(prev => [...prev, ...newSelections])
  }

  const deselectAll = (transactions: BankTransaction[]) => {
    // Remove specific transactions from selection
    const transactionIds = transactions.map(t => t.id)
    setSelectedTransactions(prev => prev.filter(t => !transactionIds.includes(t.id)))
  }

  const isSelected = (transaction: BankTransaction) => {
    return selectedTransactions.some(t => t.id === transaction.id)
  }

  const getPageSelectionState = (pageTransactions: BankTransaction[]) => {
    if (pageTransactions.length === 0) {
      return { allSelected: false, someSelected: false, indeterminate: false }
    }

    const selectedOnThisPage = pageTransactions.filter(t => isSelected(t))
    const allSelected = selectedOnThisPage.length === pageTransactions.length
    const someSelected = selectedOnThisPage.length > 0
    const indeterminate = someSelected && !allSelected

    return { allSelected, someSelected, indeterminate }
  }

  const openBulkSelection = () => {
    setBulkSelectionActive(true)
  }

  const closeBulkSelection = () => {
    setBulkSelectionActive(false)
    clearSelection()
  }

  return {
    selectedTransactions,
    bulkSelectionActive,
    addTransaction,
    removeTransaction,
    clearSelection,
    toggleTransaction,
    selectAll,
    deselectAll,
    isSelected,
    getPageSelectionState,
    openBulkSelection,
    closeBulkSelection,
  }
} 