import type { Bill } from '@internal-types/bills'
import { isBillPaid } from '@utils/bills'
import { BillSummaryPaid } from '@components/Bills/BillSummaryPaid'
import { BillSummaryUnpaid } from '@components/Bills/BillSummaryUnpaid'

type BillSummaryProps = {
  bill: Bill
}

export const BillSummary = ({ bill }: BillSummaryProps) => {
  if (isBillPaid(bill.status)) {
    return <BillSummaryPaid bill={bill} />
  }

  return <BillSummaryUnpaid bill={bill} />
}
