import { Bill, PAID_STATUS, UNPAID_STATUSES, UnpaidStatuses } from '../types/bills'

export const isBillPaid = (status?: Bill['status']) => PAID_STATUS === status

export const isBillUnpaid = (status?: Bill['status']) => {
  if (!status) {
    return false
  }

  return UNPAID_STATUSES.includes(status as UnpaidStatuses)
}
