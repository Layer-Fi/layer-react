import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { type AskFormAnswer } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'
import { AskFormSearchEntity, AskFormStepType } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { Chip, ChipGroup } from '@ui/Chip/Chip'
import { TextField } from '@ui/Form/Form'
import { Input } from '@ui/Input/Input'
import { InputGroup } from '@ui/Input/InputGroup'
import { TextArea } from '@ui/Input/TextArea'
import { VStack } from '@ui/Stack/Stack'
import { P } from '@ui/Typography/Text'
import { UnifiedAskFormSearch } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormSearch'
import { UnifiedAskFormUpload } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormUpload'
import {
  type AskFormLabels,
  type AskFormStepFields,
  type AskFormStepOption,
  findChosenOption,
  getStepOptions,
  toFollowUpAnswer,
} from '@features/bookkeeping/UnifiedAskForm/unifiedAskFormUtils'

export type UnifiedAskFormStepProps = {
  taskId: string
  step: AskFormStepFields
  prompt: string | null
  answer: AskFormAnswer | undefined
  labels: AskFormLabels
  onChange: (answer: AskFormAnswer) => void
  onLabel: (id: string, label: string) => void
  onPickOption?: (option: AskFormStepOption) => void
  depth?: number
}

const getSearchConfig = (step: AskFormStepFields) => {
  switch (step.type) {
    case AskFormStepType.Search:
    case AskFormStepType.SearchWithFreeform:
      return {
        entity: step.entity,
        allowsFreeform: step.type === AskFormStepType.SearchWithFreeform,
        placeholder: step.placeholder ?? null,
      }
    case AskFormStepType.Category:
      return step.search || step.options.length === 0
        ? { entity: AskFormSearchEntity.Category, allowsFreeform: false, placeholder: null }
        : null
    default:
      return null
  }
}

export function UnifiedAskFormStep(props: UnifiedAskFormStepProps) {
  const { taskId, step, prompt, answer, labels, onChange, onLabel, onPickOption, depth = 0 } = props
  const { t } = useTranslation()

  const options = getStepOptions(step)
  const chosenOption = findChosenOption(step, answer)
  const searchConfig = getSearchConfig(step)

  const pickOption = (option: AskFormStepOption) => {
    if (!answer || !('choice' in answer) || answer.choice !== option.value) onChange({ choice: option.value })
    onPickOption?.(option)
  }

  const renderInput = (): ReactNode => {
    if (step.type === AskFormStepType.Action) return null

    if (step.type === AskFormStepType.Upload) {
      return (
        <UnifiedAskFormUpload
          taskId={taskId}
          accept={step.accept}
          multiple={step.multiple}
          answer={answer}
          labels={labels}
          onChange={onChange}
          onLabel={onLabel}
        />
      )
    }

    if (options.length > 0 || searchConfig) {
      const followUp = depth === 0 && chosenOption?.followUp && answer && 'choice' in answer
        ? { step: chosenOption.followUp, choice: answer.choice, answer: answer.followUp }
        : null

      return (
        <>
          {options.length > 0
            ? (
              <ChipGroup<string>
                ariaLabel={prompt ?? t('bookkeeping:UnifiedAskForm.UnifiedAskFormStep.label.options', 'Options')}
                value={chosenOption ? chosenOption.value : null}
              >
                {options.map(option => (
                  <Chip<string> key={option.value} value={option.value} onPress={() => pickOption(option)}>{option.label}</Chip>
                ))}
              </ChipGroup>
            )
            : null}
          {searchConfig
            ? (
              <UnifiedAskFormSearch
                taskId={taskId}
                entity={searchConfig.entity}
                allowsFreeform={searchConfig.allowsFreeform}
                optionValues={options.map(({ value }) => value)}
                prompt={prompt}
                placeholder={searchConfig.placeholder}
                answer={answer}
                labels={labels}
                onChange={onChange}
                onLabel={onLabel}
              />
            )
            : null}
          {followUp
            ? (
              <UnifiedAskFormStep
                {...props}
                step={followUp.step}
                prompt={followUp.step.prompt ?? null}
                answer={followUp.answer}
                onChange={next => onChange({ choice: followUp.choice, followUp: toFollowUpAnswer(next) })}
                onPickOption={undefined}
                depth={1}
              />
            )
            : null}
        </>
      )
    }

    const isText = step.type === AskFormStepType.Text
    const placeholder = isText && step.placeholder
      ? step.placeholder
      : t('bookkeeping:UnifiedAskForm.UnifiedAskFormStep.placeholder.answer_in_your_words', 'Answer in your own words')
    const isMultiline = !isText || step.multiline

    return (
      <TextField
        aria-label={prompt ?? placeholder}
        value={answer && 'text' in answer ? answer.text : ''}
        onChange={text => onChange({ text })}
        textarea={isMultiline}
      >
        {isMultiline
          ? <TextArea placeholder={placeholder} rows={3} />
          : (
            <InputGroup slot='input'>
              <Input placeholder={placeholder} inset />
            </InputGroup>
          )}
      </TextField>
    )
  }

  return (
    <VStack gap='xs'>
      {prompt ? <P size='sm'>{prompt}</P> : null}
      {renderInput()}
    </VStack>
  )
}
