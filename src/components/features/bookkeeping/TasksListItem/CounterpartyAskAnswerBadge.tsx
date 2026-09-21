import { useTranslation } from 'react-i18next'

import { tConditional } from '@utils/shared/i18n/conditional'
import { Badge, BadgeSize, BadgeVariant } from '@ui/Badge/Badge'
import { type CounterpartyAskAnswerSummary } from '@features/bookkeeping/TasksListItem/counterpartyAskFormUtils'

type CounterpartyAskAnswerBadgeProps = {
  answer: CounterpartyAskAnswerSummary
}

export const CounterpartyAskAnswerBadge = ({ answer }: CounterpartyAskAnswerBadgeProps) => {
  const { t } = useTranslation()

  const label = answer.kind === 'account'
    ? answer.name
    : tConditional(t, 'bookkeeping:TasksListItem.CounterpartyAskAnswerBadge.label.answer_kind', {
      condition: answer.kind,
      cases: {
        text: 'Answered in your words',
        itemised: 'Several categories',
      },
      contexts: {
        text: 'text',
        itemised: 'itemised',
      },
    })

  return <Badge size={BadgeSize.SMALL} variant={BadgeVariant.NEUTRAL}>{label}</Badge>
}
