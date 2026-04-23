import { useTranslation } from 'react-i18next'

import { Heading, HeadingSize } from '@components/Typography/Heading'

export const TasksHeader = ({
  tasksHeader,
}: {
  tasksHeader?: string
}) => {
  const { t } = useTranslation()
  return (
    <div className='Layer__tasks-header'>
      <Heading size={HeadingSize.secondary} align='left'>
        {tasksHeader ?? t('bookkeeping:label.bookkeeping_tasks', 'Bookkeeping Tasks')}
      </Heading>
    </div>
  )
}
