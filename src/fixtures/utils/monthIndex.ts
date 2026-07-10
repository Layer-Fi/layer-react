/** Months since year zero — a single integer for ordering and iterating calendar months. */
export const toMonthIndex = (year: number, month: number) => year * 12 + (month - 1)

export const fromMonthIndex = (index: number) => ({
  year: Math.floor(index / 12),
  month: (index % 12) + 1,
})
