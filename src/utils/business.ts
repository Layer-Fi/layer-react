import { Business } from '@internal-types/business'
import { differenceInCalendarMonths, parseISO, startOfMonth } from 'date-fns'

export const getActivationDate = (business?: Business) => {
  try {
    if (business && business.activation_at) {
      return parseISO(business.activation_at)
    }

    return
  }
  catch (_err) {
    return
  }
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
