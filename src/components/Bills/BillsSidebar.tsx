import React, { RefObject, useState } from 'react'
import { useBillsRecordPaymentContext } from '../../contexts/BillsContext'
import { BillsPaymentRecorded } from './BillsPaymentRecorded'
import { BillsRecordPayment } from './BillsRecordPayment'

export const BillsSidebar = ({
  parentRef,
}: {
  parentRef?: RefObject<HTMLDivElement>
}) => {
  // const { afterSucess } = useBillsRecordPaymentContext()
  const paymentsSaved = false

  return paymentsSaved
    ? (
      <BillsPaymentRecorded />
    )
    : (
      <BillsRecordPayment />
    )
}
