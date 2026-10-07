import { type AskForm } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'

import { ASK_FORM_STEP_IDS, makeUnifiedAskFormTask, page, singlePageForm } from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'

export const makeUploadDocumentAskForm = (prompt: string): AskForm =>
  singlePageForm(page('upload', [{
    id: ASK_FORM_STEP_IDS.response,
    type: AskFormStepType.Upload,
    prompt,
    accept: ['pdf', 'png', 'jpg', 'csv', 'xlsx'],
    multiple: true,
  }]))

type UploadDocumentTaskSeed = Pick<UnifiedAskFormTask, 'id' | 'title' | 'question'>

export const makeUploadDocumentTask = ({ id, title, question }: UploadDocumentTaskSeed) =>
  makeUnifiedAskFormTask({ id, title, question, form: makeUploadDocumentAskForm(question) })
