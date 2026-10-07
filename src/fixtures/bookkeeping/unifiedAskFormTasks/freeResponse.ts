import { type AskForm } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'

import { schema } from '@fixtures/bookkeeping/schema'
import {
  ASK_FORM_STEP_IDS,
  makeUnifiedAskFormTask,
  page,
  singlePageForm,
  type TaskSeeds,
  textStep,
} from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'
import { formatDollars, formatTaskDate, monthsBeforeCurrent } from '@fixtures/bookkeeping/utils'
import { createGenerator } from '@fixtures/utils/createGenerator'
import { toMonthIndex } from '@fixtures/utils/monthIndex'

export const makeFreeResponseAskForm = (prompt: string): AskForm =>
  singlePageForm(page('respond', [textStep(ASK_FORM_STEP_IDS.response, prompt)]))

type FreeResponseTaskSeed = Pick<UnifiedAskFormTask, 'id' | 'title' | 'question'>

export const makeFreeResponseTask = ({ id, title, question }: FreeResponseTaskSeed) =>
  makeUnifiedAskFormTask({ id, title, question, form: makeFreeResponseAskForm(question) })

const generateTaskSeeds = createGenerator(schema, {
  uniqueBy: [seed => seed.id, seed => seed.day],
})

const TASK_COUNT_BY_MONTHS_AGO: Record<number, number> = { 1: 3, 3: 1, 5: 2, 8: 1, 10: 1 }

export const freeResponseTaskSeeds: TaskSeeds = (year, month) => {
  const count = TASK_COUNT_BY_MONTHS_AGO[monthsBeforeCurrent(year, month)] ?? 0

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
