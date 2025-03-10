import { formatISO } from 'date-fns'

export const toLocalDateString = (date: Date): string => formatISO(date.valueOf(), { representation: 'date' })
