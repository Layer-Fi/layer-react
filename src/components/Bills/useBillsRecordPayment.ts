import { useEffect, useMemo, useState } from 'react'
import useSWRMutation from 'swr/mutation'

import { type Bill, type BillPayment, type BillPaymentMethod } from '@internal-types/bills'
import { type Vendor } from '@internal-types/vendors'
import { type APIError } from '@models/APIError'
import { convertFromCents, convertToCents } from '@utils/format'
import { Layer } from '@api/layer'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useBillsContext } from '@contexts/BillsContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export type BillsRecordPaymentFormRecord = {
  bill?: Bill
  amount?: string | null
}

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  data,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  data: BillPayment
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      data,
      tags: ['#bills', '#bills-payment'],
    } as const
  }
}

export const useBillsRecordPayment = ({ refetchAllBills }: { refetchAllBills?: () => void }) => {
  const { businessId } = useLayerContext()
  const { data: auth } = useAuth()
  const { apiUrl } = useEnvironment()
  const { billInDetails, openBillDetails } = useBillsContext()
  const [showRecordPaymentForm, setShowRecordPaymentForm] = useState(false)
  const [bulkSelectionActive, setBulkSelectionActive] = useState(false)
  const [vendor, setVendorState] = useState<Vendor | undefined>()
  const [paymentDate, setPaymentDate] = useState<Date>(new Date())
  const [paymentMethod, setPaymentMethod] = useState<BillPaymentMethod>('ACH')
  const [billsToPay, setBillsToPay] = useState<BillsRecordPaymentFormRecord[]>([])
  const [dataSaved, setDataSaved] = useState(false)

  const openBulkSelection = () => {
    setBulkSelectionActive(true)
  }

  const setVendor = (newVendor?: Vendor) => {
    if (vendor?.id !== newVendor?.id) {
      setBillsToPay([])
    }
    setVendorState(newVendor)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billsToPay, vendor, showRecordPaymentForm])

  const setBill = (bill: Bill, index: number) => {
    if (index < 0 || index >= billsToPay.length) {
      return
    }

    // Ignore duplicated bills
    if (bill?.id && billsToPay.find(x => x.bill?.id === bill.id)) {
      return
    }

    setBillsToPay((prev) => {
      const existing = prev[index]
      if (!existing) return prev
      return [
        ...prev.slice(0, index),
        { bill, amount: existing.amount },
        ...prev.slice(index + 1),
      ]
    })
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

  const setAmountByIndex = (index: number, amount?: string | null) => {
    setBillsToPay(prev => prev.map((bill, i) => i === index ? { ...bill, amount } : bill))
  }

  const recordPaymentForBill = (bill: Bill) => {
    setVendor(bill.vendor)
    setPaymentDate(new Date())
    setBillsToPay([{ bill, amount: convertFromCents(bill.outstanding_balance ?? 0)?.toString() }])
    setShowRecordPaymentForm(true)
  }

  const payload = useMemo(() => {
    const filteredBillsToPay = billsToPay.filter(item => item.amount && item.bill?.id)

    return {
      bill_payment_allocations: filteredBillsToPay.map(item => ({
        bill_id: item.bill?.id,
        amount: Number(convertToCents(item.amount)),
      })),
      paid_at: new Date(paymentDate).toISOString(),
      method: paymentMethod,
      amount: Number(convertToCents(
        filteredBillsToPay.reduce((acc, item) => acc + Number(item.amount ?? 0), 0),
      )),
    }
  }, [billsToPay, paymentDate, paymentMethod])

  const createPaymentMutation = useSWRMutation(
    () => buildKey({
      access_token: auth?.access_token, apiUrl: auth?.apiUrl, businessId, data: payload,
    }),
    ({ accessToken, apiUrl, businessId, data }) => (
      Layer.createBillPayment(apiUrl, accessToken, {
        params: {
          businessId,
        },
        body: data,
      })
    )
      .then(async () => {
        if (refetchAllBills) {
          refetchAllBills()
        }
        await refetchSavedBills()
      }),
    {
      revalidate: false,
      throwOnError: false,
    },
  )

  const recordPayment = async () => createPaymentMutation.trigger()

  const refetchSavedBills = () =>
    Promise.all(billsToPay.map(async (item) => {
      if (!item.bill?.id) {
        return
      }

      const response = await (Layer.getBill(apiUrl, auth?.access_token, {
        params: {
          businessId,
          billId: item.bill.id,
        },
      })).call(false)

      return response
    })).then((responses) => {
      const newBillsToPay = billsToPay.map((billToPay) => {
        const found = responses.find(r => r?.data.id === billToPay.bill?.id)

        if (found) {
          return { ...billToPay, bill: found.data }
        }

        return billToPay
      }).filter(item => item.amount && item.bill?.id)

      // Update billInDetails
      if (billInDetails) {
        const updatedBillInDetails = newBillsToPay.find(item => item.bill?.id === billInDetails.id)

        if (updatedBillInDetails) {
          openBillDetails(updatedBillInDetails.bill)
        }
      }

      setBillsToPay(newBillsToPay)
      setDataSaved(true)
    })

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

  const clearRecordPaymentSelection = () => {
    setDataSaved(false)
    setPaymentDate(new Date())
    setVendor(undefined)
    setBillsToPay([])
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
    paymentMethod,
    setPaymentMethod,
    showRecordPaymentForm,
    setShowRecordPaymentForm,
    bulkSelectionActive,
    openBulkSelection,
    closeBulkSelection,
    recordPayment,
    dataSaved,
    closeRecordPayment,
    clearRecordPaymentSelection,
    recordPaymentForBill,
    payRemainingBalance,
    isLoading: createPaymentMutation.isMutating,
    apiError: createPaymentMutation.error as APIError | undefined,
  }
}
