import classNames from 'classnames'
import { ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { isCompletedTask, type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import ChevronDownFill from '@icons/ChevronDownFill'
import { Button } from '@ui/Button/Button'
import { P } from '@ui/Typography/Text'
import { CounterpartyAskAnswerBadge } from '@features/bookkeeping/TasksListItem/CounterpartyAskAnswerBadge'
import { type CounterpartyAskAnswerSummary } from '@features/bookkeeping/TasksListItem/counterpartyAskFormUtils'
import { type CounterpartyAskBackAction } from '@features/bookkeeping/TasksListItem/CounterpartyAskTaskBody'
import { getIconForTask } from '@features/bookkeeping/TasksListItem/getIconForTask'

type TasksListItemHeaderProps = {
  task: UserVisibleTask
  isOpen: boolean
  backAction: CounterpartyAskBackAction | null
  answer: CounterpartyAskAnswerSummary | null
  onClick: () => void
}

export const TasksListItemHeader = ({ task, isOpen, backAction, answer, onClick }: TasksListItemHeaderProps) => {
  const { t } = useTranslation()

  const infoClassName = classNames(
    'Layer__tasks-list-item__head-info',
    isCompletedTask(task) ? 'Layer__tasks-list-item--completed' : 'Layer__tasks-list-item--pending',
  )

  return (
    <div className='Layer__tasks-list-item__head' onClick={onClick}>
      <div className={infoClassName}>
        {isOpen && backAction
          ? (
            <Button
              className='Layer__tasks-list-item__head-info__back'
              variant='text'
              icon
              isDisabled={backAction.isDisabled}
              onPress={backAction.onBack}
              aria-label={t('common:action.back', 'Back')}
            >
              <ChevronLeft size={14} />
            </Button>
          )
          : <div className='Layer__tasks-list-item__head-info__status'>{getIconForTask(task)}</div>}
        <P className='Layer__tasks-list-item__head-info__title' variant='inherit'>{task.title}</P>
        {answer && !isOpen ? <CounterpartyAskAnswerBadge answer={answer} /> : null}
      </div>
      <ChevronDownFill
        size={16}
        className='Layer__tasks__expand-icon'
        style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-180deg)' }}
      />
    </div>
  )
}
