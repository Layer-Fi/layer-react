import { type Meta, type StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'

import { Col } from '@testUtils/storybook/layout/Col'
import { Gallery } from '@testUtils/storybook/layout/Gallery'
import { TableControlsDemo } from './TableControlsDemo'


const meta: Meta<typeof TableControlsDemo> = {
  title: 'Demos/TableControlsDemo',
  component: TableControlsDemo,
  args: {},
  decorators: [
    Story => (
      <>
        <Story />
      </>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof TableControlsDemo>

export const Default: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getAllByRole('button', { name: 'Expand customer' })[0])
  },
  render: (args) => (
    <Gallery gap={32}>
      <Col label='basic scenario'>
        <TableControlsDemo />
      </Col>
    </Gallery>
  ),
}