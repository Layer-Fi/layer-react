import { BillStatus, PaidStatuses, UnpaidStatuses } from '../types/bills'

export const isBillPaid = (status?: BillStatus) => {
  if (!status) {
    return false
  }

  return PaidStatuses.includes(status)
}

export const isBillUnpaid = (status?: BillStatus) => {
  if (!status) {
    return false
  }

  return UnpaidStatuses.includes(status)
}
