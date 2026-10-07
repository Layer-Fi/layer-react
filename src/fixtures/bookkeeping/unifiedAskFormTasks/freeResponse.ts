import { type AskForm } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'

import { schema } from '@fixtures/bookkeeping/schema'
import {
  ASK_FORM_STEP_IDS,
  makeUnifiedAskFormTask,
  page,
  seedsInFixtureYear,
  singlePageForm,
  textStep,
} from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'
import { formatDollars, formatTaskDate } from '@fixtures/bookkeeping/utils'
import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
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

const generateFreeResponseTasks = (month: number, count: number) =>
  generateTaskSeeds({ numRuns: count, seed: toMonthIndex(FIXTURE_YEAR, month) }).map(({ id, day, amountCents, merchant }) => {
    const date = formatTaskDate(month, day)

    return makeFreeResponseTask({
      id,
      title: `Transaction on ${date}`,
      question: `On ${date}, you spent ${formatDollars(amountCents)} at ${merchant}. `
        + 'Can you tell us a bit more about what this transaction was for?',
    })
  })

export const freeResponseTaskSeeds = seedsInFixtureYear({
  2: generateFreeResponseTasks(2, 1),
  4: generateFreeResponseTasks(4, 1),
  7: generateFreeResponseTasks(7, 2),
  9: generateFreeResponseTasks(9, 1),
  11: generateFreeResponseTasks(11, 3),
})
