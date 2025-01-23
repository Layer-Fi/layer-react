import { useBillsRecordPaymentContext } from '../../contexts/BillsContext'
import { BillsPaymentRecorded } from './BillsPaymentRecorded'
import { BillsRecordPayment } from './BillsRecordPayment'

export const BillsSidebar = () => {
  const { dataSaved } = useBillsRecordPaymentContext()

  return dataSaved ? <BillsPaymentRecorded /> : <BillsRecordPayment />
}
