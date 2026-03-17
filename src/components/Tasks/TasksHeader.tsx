import { useTranslation } from 'react-i18next'

import { Text, TextSize } from '@components/Typography/Text'

export const TasksHeader = ({
  tasksHeader,
}: {
  tasksHeader?: string
}) => {
  const { t } = useTranslation()
  return (
    <div className='Layer__tasks-header'>
      <Text size={TextSize.lg}>{tasksHeader ?? t('bookkeeping:label.bookkeeping_tasks', 'Bookkeeping Tasks')}</Text>
    </div>
  )
}
