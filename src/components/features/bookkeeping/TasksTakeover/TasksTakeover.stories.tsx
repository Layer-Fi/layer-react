import { useState } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'

import { getUserVisibleTasks } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { Button } from '@ui/Button/Button'
import { TasksTakeover } from '@features/bookkeeping/TasksTakeover/TasksTakeover'

import { makeSeededTasks } from '@fixtures/bookkeeping/unifiedAskFormTasks/seeds'
import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'

const TASKS = getUserVisibleTasks(makeSeededTasks(FIXTURE_YEAR, 10))

const TasksTakeoverStory = () => {
  const [taskId, setTaskId] = useState<string | null>(TASKS[0]?.id ?? null)

  return (
    <>
      <Button onPress={() => setTaskId(TASKS[0]?.id ?? null)}>Open takeover</Button>
      <TasksTakeover tasks={TASKS} taskId={taskId} onTaskChange={setTaskId} />
    </>
  )
}

const meta: Meta<typeof TasksTakeover> = {
  title: 'Bookkeeping/TasksTakeover',
  component: TasksTakeover,
  parameters: { layout: 'fullscreen' },
}

export default meta

type Story = StoryObj<typeof TasksTakeover>

export const Default: Story = {
  render: () => <TasksTakeoverStory />,
}
