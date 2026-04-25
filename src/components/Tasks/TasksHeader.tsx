import { useTranslation } from 'react-i18next'

import { HStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'

export const TasksHeader = ({
  tasksHeader,
}: {
  tasksHeader?: string
}) => {
  const { t } = useTranslation()
  return (
    <HStack
      className='Layer__tasks-header'
      align='center'
      justify='space-between'
      gap='md'
      pb='md'
      pi='lg'
    >
      <Heading size='sm'>
        {tasksHeader ?? t('bookkeeping:label.bookkeeping_tasks', 'Bookkeeping Tasks')}
      </Heading>
    </HStack>
  )
}
