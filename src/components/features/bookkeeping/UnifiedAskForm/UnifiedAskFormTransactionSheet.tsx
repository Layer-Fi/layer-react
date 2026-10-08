import { useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { type AskFormStep } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { type AskFormTransaction } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { UnifiedAskFormRowSheet } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormRowSheet'
import { UnifiedAskFormStep } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormStep'
import { UnifiedAskFormTransactionCells } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormTransactionCells'
import { type UnifiedAskFormApi } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskForm'
import { isRowComplete } from '@features/bookkeeping/UnifiedAskForm/utils/completion'
import { getChoiceLabel } from '@features/bookkeeping/UnifiedAskForm/utils/labels'
import { findFollowUp } from '@features/bookkeeping/UnifiedAskForm/utils/steps'

type UnifiedAskFormTransactionSheetProps = {
  form: UnifiedAskFormApi
  pageId: string
  taskId: string
  step: AskFormStep
  prompt: string | null
  transactions: ReadonlyArray<AskFormTransaction>
}

export const UnifiedAskFormTransactionSheet = ({ form, pageId, taskId, step, prompt, transactions }: UnifiedAskFormTransactionSheetProps) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const fields = `pages.${pageId}.${step.id}` as const
  const rows = useStore(form.store, state => state.values.pages[pageId]?.[step.id]?.rows ?? [])

  const rowIndexById = new Map(rows.map(({ transactionId }, index) => [transactionId, index]))

  const sheetRows = transactions.flatMap((transaction) => {
    const index = rowIndexById.get(transaction.id)
    const row = index === undefined ? undefined : rows[index]
    if (!row) return []

    const isComplete = isRowComplete(step, row)

    return [{
      id: transaction.id,
      summary: <UnifiedAskFormTransactionCells transaction={transaction} />,
      answerLabel: isComplete ? getChoiceLabel(step, row) : null,
      isComplete,
    }]
  })

  const answeredCount = sheetRows.filter(({ isComplete }) => isComplete).length

  return (
    <UnifiedAskFormRowSheet
      rows={sheetRows}
      prompt={prompt}
      countLabel={t('bookkeeping:UnifiedAskForm.UnifiedAskFormTransactionSheet.label.categorized_count', '{{answered}} of {{total}} categorized', {
        answered: formatNumber(answeredCount),
        total: formatNumber(sheetRows.length),
      })}
      renderEditor={(transactionId, { advance }) => {
        const index = rowIndexById.get(transactionId) ?? -1

        return (
          <UnifiedAskFormStep
            form={form}
            fields={`${fields}.rows[${index}]`}
            taskId={taskId}
            step={step}
            prompt={null}
            onSelect={(value) => {
              if (!findFollowUp(step, value)) advance()
            }}
          />
        )
      }}
    />
  )
}
