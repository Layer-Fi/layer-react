import { type Meta, type StoryObj } from '@storybook/react-vite'

import type { Spacing } from '@ui/sharedUITypes'
import { HStack, VStack } from '@ui/Stack/Stack'

const GAPS: Spacing[] = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl']

const meta: Meta = {
  title: 'UI/Stack',
}

export default meta

type Story = StoryObj

const Box = () => (
  <div style={{ width: 40, height: 40, background: '#4B8DF8', borderRadius: 4 }} />
)

export const Horizontal: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 24 }}>
      {GAPS.map(gap => (
        <div key={gap} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 48, fontSize: 12, opacity: 0.6 }}>{gap}</span>
          <HStack gap={gap}>
            <Box />
            <Box />
            <Box />
          </HStack>
        </div>
      ))}
    </div>
  ),
}

export const Vertical: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', gap: 32, padding: 24 }}>
      {GAPS.map(gap => (
        <div key={gap} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, opacity: 0.6 }}>{gap}</span>
          <VStack gap={gap}>
            <Box />
            <Box />
            <Box />
          </VStack>
        </div>
      ))}
    </div>
  ),
}
