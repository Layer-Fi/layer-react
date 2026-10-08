import { type ReactNode } from 'react'

import { type ChipOption } from '@blocks/Form/FormChipGroupField'
import { UnifiedAskFormChoiceStep } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormChoiceStep'
import { type UnifiedAskFormApi } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskForm'
import { type AskFormSearchConfig, useUnifiedAskFormSearch } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskFormSearch'
import { type AskFormInputPath } from '@features/bookkeeping/UnifiedAskForm/utils/formValues'

type UnifiedAskFormSearchChoiceStepProps = {
  form: UnifiedAskFormApi
  fields: AskFormInputPath
  taskId: string
  config: AskFormSearchConfig
  label: string
  prompt: string | null
  options: ReadonlyArray<ChipOption<string>>
  onSelect?: (value: string) => void
  onPickChange?: (value: string | null) => void
  renderFollowUp?: (value: string) => ReactNode
}

/** A `UnifiedAskFormChoiceStep` with search; kept apart so only searchable steps set up a search. */
export const UnifiedAskFormSearchChoiceStep = ({ taskId, config, ...choiceProps }: UnifiedAskFormSearchChoiceStepProps) => {
  const search = useUnifiedAskFormSearch(taskId, config)

  return <UnifiedAskFormChoiceStep {...choiceProps} search={search} />
}
