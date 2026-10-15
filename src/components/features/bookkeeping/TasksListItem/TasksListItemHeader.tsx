import { ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import ChevronDownFill from '@icons/ChevronDownFill'
import { Button } from '@ui/Button/Button'
import { TaskRow } from '@features/bookkeeping/TaskRow/TaskRow'

export type TasksListItemBackAction = {
  isDisabled: boolean
  onBack: () => void
}

type TasksListItemHeaderProps = {
  task: UnifiedAskFormTask
  isOpen: boolean
  backAction: TasksListItemBackAction | null
  onClick: () => void
}

export const TasksListItemHeader = ({ task, isOpen, backAction, onClick }: TasksListItemHeaderProps) => {
  const { t } = useTranslation()

  const slots = {
    Leading: isOpen && backAction
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
      : undefined,
    Trailing: (
      <ChevronDownFill
        size={16}
        className='Layer__tasks__expand-icon'
        style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-180deg)' }}
      />
    ),
  }

  return (
    <div className='Layer__tasks-list-item__head' onClick={onClick}>
      <TaskRow task={task} slots={slots} />
    </div>
  )
}
