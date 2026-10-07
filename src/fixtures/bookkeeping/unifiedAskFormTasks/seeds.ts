import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'

import { schema } from '@fixtures/bookkeeping/schema'
import { accountMaskTaskSeeds } from '@fixtures/bookkeeping/unifiedAskFormTasks/accountMask'
import { counterpartyTaskSeeds } from '@fixtures/bookkeeping/unifiedAskFormTasks/counterparty'
import { makeFreeResponseTask } from '@fixtures/bookkeeping/unifiedAskFormTasks/freeResponse'
import { p2pCounterpartyTaskSeeds } from '@fixtures/bookkeeping/unifiedAskFormTasks/p2pCounterparty'
import { formatDollars, formatTaskDate } from '@fixtures/bookkeeping/utils'
import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { createGenerator } from '@fixtures/utils/createGenerator'
import { toMonthIndex } from '@fixtures/utils/monthIndex'

const generateTaskSeeds = createGenerator(schema, {
  uniqueBy: [seed => seed.id, seed => seed.day],
})

const FREE_RESPONSE_TASK_COUNT_BY_MONTHS_AGO: Record<number, number> = { 1: 3, 3: 1, 5: 2, 8: 1, 10: 1 }

export const monthsBeforeCurrent = (year: number, month: number) => {
  const now = new Date()
  return toMonthIndex(now.getFullYear(), now.getMonth() + 1) - toMonthIndex(year, month)
}

const makeGeneratedFreeResponseTasks = (year: number, month: number): UnifiedAskFormTask[] => {
  const count = FREE_RESPONSE_TASK_COUNT_BY_MONTHS_AGO[monthsBeforeCurrent(year, month)] ?? 0

  if (count === 0) return []

  return generateTaskSeeds({ numRuns: count, seed: toMonthIndex(year, month) }).map(({ id, day, amountCents, merchant }) => {
    const date = formatTaskDate(month, day)

    return makeFreeResponseTask({
      id,
      title: `Transaction on ${date}`,
      question: `On ${date}, you spent ${formatDollars(amountCents)} at ${merchant}. `
        + 'Can you tell us a bit more about what this transaction was for?',
    })
  })
}

const HANDWRITTEN_SEEDS = [counterpartyTaskSeeds, p2pCounterpartyTaskSeeds, accountMaskTaskSeeds]

const makeHandwrittenTasks = (year: number, month: number): UnifiedAskFormTask[] =>
  (year === FIXTURE_YEAR ? HANDWRITTEN_SEEDS.flatMap(seeds => seeds[month] ?? []) : [])

export const makeSeededTasks = (year: number, month: number): UnifiedAskFormTask[] => [
  ...makeGeneratedFreeResponseTasks(year, month),
  ...makeHandwrittenTasks(year, month),
]
