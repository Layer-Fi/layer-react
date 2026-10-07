import { type AskForm } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'

import { ASK_FORM_STEP_IDS, makeUnifiedAskFormTask, page, singlePageForm, textStep } from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'

export const makeFreeResponseAskForm = (prompt: string): AskForm =>
  singlePageForm(page('respond', [textStep(ASK_FORM_STEP_IDS.response, prompt)]))

type FreeResponseTaskSeed = Pick<UnifiedAskFormTask, 'id' | 'title' | 'question'>

export const makeFreeResponseTask = ({ id, title, question }: FreeResponseTaskSeed) =>
  makeUnifiedAskFormTask({ id, title, question, form: makeFreeResponseAskForm(question) })
