import { type AskForm } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'

import { ASK_FORM_STEP_IDS, makeUnifiedAskFormTask, page, seedsInFixtureYear, singlePageForm } from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'

export const makeUploadDocumentAskForm = (prompt: string): AskForm =>
  singlePageForm(page('upload', [{
    id: ASK_FORM_STEP_IDS.response,
    editable: true,
    type: AskFormStepType.Upload,
    prompt,
    accept: ['pdf', 'png', 'jpg', 'csv', 'xlsx'],
    multiple: true,
  }]))

const UPLOAD_RECEIPT_QUESTION = 'Upload the receipt for your Staples purchase on Nov 12.'

export const uploadDocumentTaskSeeds = seedsInFixtureYear({
  11: makeUnifiedAskFormTask({
    id: '00000000-0000-4000-8000-0000000a0001',
    title: 'Receipt for Nov 12',
    question: UPLOAD_RECEIPT_QUESTION,
    form: makeUploadDocumentAskForm(UPLOAD_RECEIPT_QUESTION),
  }),
})
