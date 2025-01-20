import React, { useState } from 'react'
import { Bill } from '../types/bills'
import { sleep } from '../utils/helpers'
import { Vendor } from '../types/vendors'
import { parseISO } from 'date-fns'

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
  const [dataSaved, setDataSaved] = useState(false)

  const setBill = (bill: Bill, index: number) => {
    if (index < 0 || index >= billsToPay.length) {
      return
    }

    // Ignore duplicate bills
    if (bill?.id && billsToPay.find(x => x.bill?.id === bill.id)) {
      return
    }

    setBillsToPay(prev => [
      ...prev.slice(0, index),
      { bill, amount: prev[index].amount },
      ...prev.slice(index + 1),
    ])
  }

  const addBill = (bill?: Bill) => {
    // Ignore duplicate bills
    if (bill?.id && billsToPay.find(x => x.bill?.id === bill.id)) {
      return
    }

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

  const recordPaymentForBill = (bill: Bill) => {
    setVendor(bill.vendor)
    setPaymentDate(bill.due_at ? parseISO(bill.due_at) : new Date())
    setBillsToPay([{ bill, amount: bill.total_amount }])
    setShowRecordPaymentForm(true)
  }

  const recordPayment = async () => {
    /** @TODO - call API */
    await sleep(500)
    /** @TODO - temporarily so we can jump to summary */
    setDataSaved(true)
  }

  const closeRecordPayment = () => {
    if (dataSaved) {
      setDataSaved(false)
      setPaymentDate(new Date())
      setVendor(undefined)
      setBillsToPay([])
    }
    setShowRecordPaymentForm(false)
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
    recordPayment,
    dataSaved,
    closeRecordPayment,
    recordPaymentForBill,
  }
}
