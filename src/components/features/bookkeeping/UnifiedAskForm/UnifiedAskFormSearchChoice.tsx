import { type ReactNode } from 'react'

import { type ChipOption } from '@blocks/Form/FormChipGroupField'
import { ChoiceStep } from '@blocks/FormSteps/ChoiceStep'
import { type UnifiedAskFormApi } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskForm'
import { type AskFormSearchConfig, useUnifiedAskFormSearch } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskFormSearch'
import { type AskFormInputPath } from '@features/bookkeeping/UnifiedAskForm/utils/formValues'

type UnifiedAskFormSearchChoiceProps = {
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

/** A `ChoiceStep` with search; kept apart so only searchable steps set up a search. */
export const UnifiedAskFormSearchChoice = ({ taskId, config, ...choiceProps }: UnifiedAskFormSearchChoiceProps) => {
  const search = useUnifiedAskFormSearch(taskId, config)

  return <ChoiceStep {...choiceProps} search={search} />
}
