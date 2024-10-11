import React, { RefObject, useContext, useState } from 'react'
import { BillsContext } from '../../contexts/BillsContext'
import { BillsPaymentRecorded } from '../BillsPaymentRecorded'
import { BillsRecordPayment } from '../BillsRecordPayment'

export const BillsSidebar = ({
  parentRef,
}: {
  parentRef?: RefObject<HTMLDivElement>
}) => {
  const { selectedEntryId } = useContext(BillsContext)
  const [recordedPayments, setRecordedPayments] = useState<string[]>([])

  const isPaymentRecorded =
    selectedEntryId && recordedPayments.includes(selectedEntryId)

  const setPaymentRecorded = () => {
    if (selectedEntryId) {
      if (!isPaymentRecorded) {
        setRecordedPayments([...recordedPayments, selectedEntryId])
      } else {
        setRecordedPayments(
          recordedPayments.filter(id => id !== selectedEntryId),
        )
      }
    }
  }

  return !isPaymentRecorded ? (
    <BillsPaymentRecorded />
  ) : (
    <BillsRecordPayment setPaymentRecorded={setPaymentRecorded} />
  )
}
