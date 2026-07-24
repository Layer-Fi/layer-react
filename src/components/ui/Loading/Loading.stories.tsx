import { type Meta, type StoryObj } from '@storybook/react-vite'

import { ElevatedLoadingSpinner, ElevatedLoadingSpinnerContainer } from '@ui/Loading/ElevatedLoadingSpinner'
import { LoadingSpinner } from '@ui/Loading/LoadingSpinner'

const SIZES = [16, 24, 48]

const meta: Meta<typeof LoadingSpinner> = {
  title: 'UI/Loading',
  component: LoadingSpinner,
  args: {
    size: 24,
  },
}

export default meta

type Story = StoryObj<typeof LoadingSpinner>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
}

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {SIZES.map(size => <LoadingSpinner key={size} size={size} />)}
      </div>
      <ElevatedLoadingSpinnerContainer>
        <ElevatedLoadingSpinner />
      </ElevatedLoadingSpinnerContainer>
    </div>
  ),
}
