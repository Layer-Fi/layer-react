import { type Meta, type StoryObj } from '@storybook/react-vite'

import type { Spacing } from '@ui/sharedUITypes'
import { HStack, VStack } from '@ui/Stack/Stack'

import { Col, Gallery, Row } from '@testUtils/storybook/layout/gallery'

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
    <Gallery gap={12}>
      {GAPS.map(gap => (
        <Row key={gap} label={gap} labelSize={48}>
          <HStack gap={gap}>
            <Box />
            <Box />
            <Box />
          </HStack>
        </Row>
      ))}
    </Gallery>
  ),
}

export const Vertical: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery direction='row' gap={32}>
      {GAPS.map(gap => (
        <Col key={gap} label={gap} align='center'>
          <VStack gap={gap}>
            <Box />
            <Box />
            <Box />
          </VStack>
        </Col>
      ))}
    </Gallery>
  ),
}
