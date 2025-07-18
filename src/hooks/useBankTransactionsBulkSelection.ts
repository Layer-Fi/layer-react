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
    setSelectedTransactions(transactions)
  }

  const isSelected = (transaction: BankTransaction) => {
    return selectedTransactions.some(t => t.id === transaction.id)
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
    isSelected,
    openBulkSelection,
    closeBulkSelection,
  }
} 