import type { Bill } from '../../types'
import { isBillPaid } from '../../utils/bills'
import { BillSummaryPaid } from './BillSummaryPaid'
import { BillSummaryUnpaid } from './BillSummaryUnpaid'

type BillSummaryProps = {
  bill: Bill
}

export const BillSummary = ({ bill }: BillSummaryProps) => {
  if (isBillPaid(bill.status)) {
    return <BillSummaryPaid bill={bill} />
  }

  return <BillSummaryUnpaid bill={bill} />
}
