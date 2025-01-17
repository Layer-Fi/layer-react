import React, { RefObject } from 'react'
import { useBillsRecordPaymentContext } from '../../contexts/BillsContext'
import { BillsPaymentRecorded } from './BillsPaymentRecorded'
import { BillsRecordPayment } from './BillsRecordPayment'

export const BillsSidebar = ({
  parentRef,
}: {
  parentRef?: RefObject<HTMLDivElement>
}) => {
  const { dataSaved } = useBillsRecordPaymentContext()

  return dataSaved
    ? (
      <BillsPaymentRecorded />
    )
    : (
      <BillsRecordPayment />
    )
}
