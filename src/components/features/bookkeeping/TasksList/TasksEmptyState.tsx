import { Smile } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { P } from '@ui/Typography/Text'

export const TasksEmptyState = () => {
  const { t } = useTranslation()
  return (
    <div className='Layer__tasks-empty-state'>
      <div className='Layer__tasks-icon'>
        <Smile size={12} color='#3B9C63' />
      </div>
      <P size='sm' variant='subtle'>
        {t('bookkeeping:TasksList.TasksEmptyState.label.pending_tasks', 'There are no pending tasks!')}
        <br />
        {' '}
        {t('bookkeeping:TasksList.TasksEmptyState.label.great_job', 'Great job!')}
      </P>
    </div>
  )
}
