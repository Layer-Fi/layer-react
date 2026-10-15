import { type AskForm } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'

import { ASK_FORM_STEP_IDS, checklistStep, fixtureId, makeUnifiedAskFormTask, page, seedsInFixtureYear, singlePageForm } from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'

const CONFIRMATION_COMPLETED_VALUE = 'completed'

export const makeConfirmationAskForm = (prompt: string): AskForm =>
  singlePageForm(page('confirmation', [
    checklistStep(ASK_FORM_STEP_IDS.confirmation, prompt, [
      { value: CONFIRMATION_COMPLETED_VALUE, label: 'I have completed this task', required: false },
    ]),
  ]))

const GUSTO_ACCESS_QUESTION = 'Add Layer as a user in Gusto so we can pull your payroll reports.'

export const confirmationTaskSeeds = seedsInFixtureYear({
  11: makeUnifiedAskFormTask({
    id: fixtureId('b11'),
    title: 'Give us access to Gusto',
    question: GUSTO_ACCESS_QUESTION,
    form: makeConfirmationAskForm(GUSTO_ACCESS_QUESTION),
  }),
})
