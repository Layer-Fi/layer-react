import { useEffect, useState } from 'react'
import { Bill } from '../types/bills'
import { sleep } from '../utils/helpers'
import { Vendor } from '../types/vendors'
import { convertFromCents } from '../utils/format'

export type BillsRecordPaymentFormRecord = {
  bill?: Bill
  amount?: string
}

export const useBillsRecordPayment = () => {
  const [showRecordPaymentForm, setShowRecordPaymentForm] = useState(false)
  const [bulkSelectionActive, setBulkSelectionActive] = useState(false)
  const [vendor, setVendor] = useState<Vendor | undefined>()
  const [paymentDate, setPaymentDate] = useState<Date>(new Date())
  const [billsToPay, setBillsToPay] = useState<BillsRecordPaymentFormRecord[]>([])
  const [dataSaved, setDataSaved] = useState(false)

  const openBulkSelection = () => {
    setBulkSelectionActive(true)
  }

  const closeBulkSelection = () => {
    setVendor(undefined)
    setBulkSelectionActive(false)
  }

  useEffect(() => {
    if (vendor && billsToPay.length === 0) {
      setVendor(undefined)
    }

    if (showRecordPaymentForm && billsToPay.length === 0) {
      setShowRecordPaymentForm(false)
    }
  }, [billsToPay, vendor, showRecordPaymentForm])

  const setBill = (bill: Bill, index: number) => {
    if (index < 0 || index >= billsToPay.length) {
      return
    }

    // Ignore duplicated bills
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
    // Ignore duplicated bills
    if (bill?.id && billsToPay.find(x => x.bill?.id === bill.id)) {
      return
    }

    if (bill && bill.vendor?.id && bill.vendor?.id !== vendor?.id) {
      setVendor(bill?.vendor)
    }

    setBillsToPay(prev => (
      [...prev, { bill, amount: undefined }].filter(
        x => !x.bill || !bill || x.bill?.vendor?.id === bill?.vendor?.id,
      )),
    )
  }

  const removeBill = (bill: Bill) => {
    setBillsToPay(prev => prev.filter(record => record.bill?.id !== bill.id))
  }

  const removeBillByIndex = (index: number) => {
    setBillsToPay(prev => prev.filter((_, i) => i !== index))
  }

  const setAmount = (billId: string, amount: string) => {
    setBillsToPay(prev => prev.map(bill => bill.bill?.id === billId ? { ...bill, amount } : bill))
  }

  const setAmountByIndex = (index: number, amount?: string) => {
    setBillsToPay(prev => prev.map((bill, i) => i === index ? { ...bill, amount } : bill))
  }

  const recordPaymentForBill = (bill: Bill) => {
    setVendor(bill.vendor)
    setPaymentDate(new Date())
    setBillsToPay([{ bill, amount: convertFromCents(bill.total_amount)?.toString() }])
    setShowRecordPaymentForm(true)
  }

  const recordPayment = async () => {
    /** @TODO - call API */
    await sleep(500)
    /** @TODO - temporarily so we can jump to summary */
    await refetchSavedBills()
    setDataSaved(true)
  }

  const refetchSavedBills = async () => {
    /** @TODO - call API */
    await sleep(500)
    /**
     * @TODO - update billsToPay by setting new outstanding balance and status
     * probably overwritting each bill with a new bill will do the job
     */
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

  const payRemainingBalance = () => {
    setBillsToPay(prev =>
      prev
        .filter(record => record.bill?.status !== 'PAID')
        .map(record => ({ ...record, amount: undefined })),
    )
    setDataSaved(false)
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
    openBulkSelection,
    closeBulkSelection,
    recordPayment,
    dataSaved,
    closeRecordPayment,
    recordPaymentForBill,
    payRemainingBalance,
  }
}
