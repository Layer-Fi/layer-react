import { type PropsWithChildren, useLayoutEffect, useState } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'

import { useGlobalDateRangeActions } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { unstable_MileageTracking } from '@views/MileageTracking'

/*
 * The committed trip fixtures all fall in this year, while the global date
 * store defaults to "now" - pin the year picker so stories open on data.
 */
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

const meta: Meta<typeof unstable_MileageTracking> = {
  title: 'Views/MileageTracking',
  component: unstable_MileageTracking,
  args: {
    showTitle: true,
  },
  argTypes: {
    showTitle: {
      control: 'boolean',
      description: 'Show the view title and header row',
    },
  },
  decorators: [
    Story => (
      <PinnedFixtureYear>
        <Story />
      </PinnedFixtureYear>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof unstable_MileageTracking>

export const Default: Story = {}
