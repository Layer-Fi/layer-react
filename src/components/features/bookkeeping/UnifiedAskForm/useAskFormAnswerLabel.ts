import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type AskFormAnswer } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'
import { tPlural } from '@utils/shared/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import {
  type AskFormLabels,
  type AskFormStepFields,
  findChosenOption,
} from '@features/bookkeeping/UnifiedAskForm/unifiedAskFormUtils'

export const useAskFormAnswerLabel = (labels: AskFormLabels) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()

  return useCallback(function getAnswerLabel(step: AskFormStepFields, answer: AskFormAnswer | undefined): string | null {
    if (!answer) return null

    if ('choice' in answer) {
      const option = findChosenOption(step, answer)
      const isFreeTextFollowUp = answer.followUp !== undefined && 'text' in answer.followUp
      const followUpLabel = option?.followUp && !isFreeTextFollowUp ? getAnswerLabel(option.followUp, answer.followUp) : null

      return followUpLabel ?? option?.label ?? labels[answer.choice] ?? answer.choice
    }

    if ('text' in answer) return answer.text.trim() || null

    if ('documentIds' in answer) {
      return tPlural(t, 'bookkeeping:UnifiedAskForm.useAskFormAnswerLabel.label.file_count', {
        count: answer.documentIds.length,
        displayCount: formatNumber(answer.documentIds.length),
        one: '{{displayCount}} file',
        other: '{{displayCount}} files',
      })
    }

    if ('completed' in answer) return t('bookkeeping:UnifiedAskForm.useAskFormAnswerLabel.label.done', 'Done')

    const rowLabels = new Set(answer.transactionAnswers.map(row => getAnswerLabel(step, row.answer)))
    const [onlyLabel] = rowLabels

    return rowLabels.size === 1 && onlyLabel
      ? onlyLabel
      : t('bookkeeping:UnifiedAskForm.useAskFormAnswerLabel.label.varies_by_transaction', 'Varies by transaction')
  }, [formatNumber, labels, t])
}
