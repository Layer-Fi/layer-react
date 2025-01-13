import React, { useState } from 'react'
import { Bill } from './useBills'

/** @TODO move somewhere else, ie. types/* */
export type Vendor = {
  id: string
  name: string
}

export type BillsRecordPaymentFormRecord = {
  bill?: Bill
  amount?: number // Cents
}

export const useBillsRecordPayment = () => {
  const [showRecordPaymentForm, setShowRecordPaymentForm] = useState(false)
  const [bulkSelectionActive, setBulkSelectionActive] = useState(false)
  const [vendor, setVendor] = useState<Vendor | undefined>()
  const [paymentDate, setPaymentDate] = useState<Date>(new Date())
  const [billsToPay, setBillsToPay] = useState<BillsRecordPaymentFormRecord[]>([])

  const setBill = (bill: Bill, index: number) => {
    if (index < 0 || index >= billsToPay.length) {
      return
    }

    setBillsToPay(prev => [
      ...prev.slice(0, index),
      { bill, amount: prev[index].amount },
      ...prev.slice(index + 1),
    ])
  }

  const addBill = (bill?: Bill) => {
    setBillsToPay(prev => [...prev, { bill, amount: undefined }])
  }

  const removeBill = (bill: Bill) => {
    setBillsToPay(prev => prev.filter(record => record.bill?.id !== bill.id))
  }

  const removeBillByIndex = (index: number) => {
    setBillsToPay(prev => prev.filter((_, i) => i !== index))
  }

  const setAmount = (billId: string, amount: number) => {
    setBillsToPay(prev => prev.map(bill => bill.bill?.id === billId ? { ...bill, amount } : bill))
  }

  const setAmountByIndex = (index: number, amount: number) => {
    setBillsToPay(prev => prev.map((bill, i) => i === index ? { ...bill, amount } : bill))
  }

  return {
    billsToPay,
    setBill,
    addBill,
    removeBill,
    removeBillByIndex,
    setAmount,
    setAmountByIndex,
    vendor,
    setVendor,
    paymentDate,
    setPaymentDate,
    showRecordPaymentForm,
    setShowRecordPaymentForm,
    bulkSelectionActive,
    setBulkSelectionActive,
  }
}
