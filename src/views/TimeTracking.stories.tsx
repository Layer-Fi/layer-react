import { type PropsWithChildren, useLayoutEffect, useState } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'

import { useGlobalDateRangeActions } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { TimeTracking } from '@views/TimeTracking'

const FIXTURE_YEAR = 2025

const PinnedFixtureYear = ({ children }: PropsWithChildren) => {
  const { setYear } = useGlobalDateRangeActions()
  const [isPinned, setIsPinned] = useState(false)

  useLayoutEffect(() => {
    setYear({ startDate: new Date(FIXTURE_YEAR, 0, 1) })
    setIsPinned(true)
  }, [setYear])

  return isPinned ? children : null
}

type TimeTrackingStoryArgs = {
  showTitle: boolean
  title: string
  showReportsAction: boolean
}

const meta: Meta<TimeTrackingStoryArgs> = {
  title: 'Views/TimeTracking',
  component: TimeTracking,
  args: {
    showTitle: true,
    title: '',
    showReportsAction: false,
  },
  argTypes: {
    showTitle: {
      control: 'boolean',
      description: 'Show the view title and header row',
    },
    showReportsAction: {
      control: 'boolean',
      description: 'Show the Reports item in the header menu',
    },
    title: {
      control: 'text',
      description: 'stringOverrides.title — leave blank to use the default',
      table: { category: 'String overrides', defaultValue: { summary: 'Time Tracking' } },
    },
  },
  decorators: [
    Story => (
      <PinnedFixtureYear>
        <Story />
      </PinnedFixtureYear>
    ),
  ],
  render: ({ showTitle, title, showReportsAction }) => (
    <TimeTracking
      showTitle={showTitle}
      stringOverrides={title ? { title } : undefined}
      onReportsClick={showReportsAction ? () => window.alert('Reports clicked') : undefined}
    />
  ),
}

export default meta

type Story = StoryObj<TimeTrackingStoryArgs>

export const Default: Story = {}
