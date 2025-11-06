import { Bill, BillStatus, PAID_STATUS, UNPAID_STATUSES } from '@internal-types/bills'

export const isBillPaid = (status?: Bill['status']) => PAID_STATUS === status

export const isBillUnpaid = (status?: Bill['status']) => {
  if (!status) {
    return false
  }

  return ([...UNPAID_STATUSES] as BillStatus[]).includes(status)
}
