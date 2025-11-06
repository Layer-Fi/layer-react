import { useBillsRecordPaymentContext } from '@contexts/BillsContext'
import { BillsPaymentRecorded } from '@components/Bills/BillsPaymentRecorded'
import { BillsRecordPayment } from '@components/Bills/BillsRecordPayment'

export const BillsSidebar = () => {
  const { dataSaved } = useBillsRecordPaymentContext()

  return dataSaved ? <BillsPaymentRecorded /> : <BillsRecordPayment />
}
