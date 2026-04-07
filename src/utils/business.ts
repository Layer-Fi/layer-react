import { differenceInCalendarMonths, startOfMonth } from 'date-fns'

import { type Business } from '@schemas/business'

export const getActivationDate = (business?: Business) => {
  return business?.activationAt
}

export const getEarliestDateToBrowse = (business?: Business) => {
  const activationDate = getActivationDate(business)

  if (activationDate) {
    return startOfMonth(activationDate)
  }

  return
}

export const isDateAllowedToBrowse = (date: Date, business?: Business) => {
  if (!business || !date) {
    return true
  }

  const activationDate = getEarliestDateToBrowse(business)

  if (!activationDate) {
    return true
  }

  return differenceInCalendarMonths(startOfMonth(date), activationDate) >= 0
}
