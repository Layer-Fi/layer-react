import { useTranslation } from 'react-i18next'

import { Heading } from '@ui/Typography/Heading'

export const TasksHeader = ({
  tasksHeader,
}: {
  tasksHeader?: string
}) => {
  const { t } = useTranslation()
  return (
    <div className='Layer__tasks-header'>
      <Heading size='sm'>
        {tasksHeader ?? t('bookkeeping:label.bookkeeping_tasks', 'Bookkeeping Tasks')}
      </Heading>
    </div>
  )
}
