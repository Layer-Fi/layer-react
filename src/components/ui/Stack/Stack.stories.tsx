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

const Row = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <span style={{ width: 48, fontSize: 12, opacity: 0.6 }}>{label}</span>
    {children}
  </div>
)

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {GAPS.map(gap => (
          <Row key={gap} label={gap}>
            <HStack gap={gap}>
              <Box />
              <Box />
              <Box />
            </HStack>
          </Row>
        ))}
      </div>
      <HStack gap='xl'>
        <VStack gap='sm'>
          <Box />
          <Box />
          <Box />
        </VStack>
        <HStack gap='sm'>
          <Box />
          <Box />
          <Box />
        </HStack>
      </HStack>
    </div>
  ),
}
