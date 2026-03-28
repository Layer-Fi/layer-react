export const TAX_BANNER_REVIEW_COUNT = 16
export const TAX_BANNER_REVIEW_AMOUNT = 210000

export const getQuarterDueDate = (year: number, quarter: number) => {
  switch (quarter) {
    case 1:
      return new Date(year, 3, 15)
    case 2:
      return new Date(year, 5, 15)
    case 3:
      return new Date(year, 8, 15)
    case 4:
      return new Date(year + 1, 0, 15)
    default:
      return new Date(year, 0, 15)
  }
}

export const formatDateString = (date: Date) => {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export const getQuarterDueDateString = (year: number, quarter: number) => {
  return formatDateString(getQuarterDueDate(year, quarter))
}
