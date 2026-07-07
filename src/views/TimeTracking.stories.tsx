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
  parameters: {
    controls: { include: ['showTitle', 'onReportsClick', 'stringOverrides.title'] },
  },
  args: {
    showTitle: true,
    title: '',
    showReportsAction: false,
  },
  argTypes: {
    onReportsClick: { table: { disable: true } },
    stringOverrides: { table: { disable: true } },
    showTitle: {
      control: 'boolean',
      description: 'Show the view title and header row',
    },
    showReportsAction: {
      name: 'onReportsClick',
      control: 'boolean',
      description:
        'The real prop is the `onReportsClick: () => void` callback. Toggle this on to '
        + 'provide it (a Reports item appears in the header menu; clicking it fires the '
        + 'callback — an alert here) or off to omit it.',
      table: {
        category: 'Callbacks',
        type: { summary: '() => void' },
      },
    },
    title: {
      name: 'stringOverrides.title',
      control: 'text',
      description:
        'The real prop is `stringOverrides?: { title?: string }`. Type a value to set '
        + '`stringOverrides.title`, or leave it blank to omit the override and use the default.',
      table: {
        category: 'String overrides',
        type: { summary: '{ title?: string }' },
        defaultValue: { summary: 'Time Tracking' },
      },
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
