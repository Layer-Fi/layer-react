import { type AskForm } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'

import { ASK_FORM_STEP_IDS, page, singlePageForm } from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'

export const makeUploadDocumentAskForm = (prompt: string): AskForm =>
  singlePageForm(page('upload', [{
    id: ASK_FORM_STEP_IDS.response,
    editable: true,
    type: AskFormStepType.Upload,
    prompt,
    accept: ['pdf', 'png', 'jpg', 'csv', 'xlsx'],
    multiple: true,
  }]))
