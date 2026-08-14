import { type Meta, type StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'

import { Col } from '@testUtils/storybook/layout/Col'
import { Gallery } from '@testUtils/storybook/layout/Gallery'
import { TableControls } from './TableControls'


const meta: Meta<typeof TableControls> = {
  title: 'Blocks/TableControls',
  component: TableControls,
  args: {
    filterTokens: [
      {
        id: 'filter1',
        props: {
          field: 'Amount',
          operator: 'is less than',
          operatorOptions: [
            { value: 'lt', label: 'is less than' },
            { value: 'gt', label: 'is greater than' },
            { value: 'eq', label: 'is equal to' },
          ],
          value: '$100',
          valueType: 'string',
          onClose: () => alert('closed!'),
          onOperatorChange: () => alert('operator change!'),
          onValueChange: () => alert('value change')
        }
      },
    ],
    onAddFilter: () => alert('add filter!'),
    onClear: () => alert('clear all filters!')
  },
  decorators: [
    Story => (
      <>
        <Story />
      </>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof TableControls>

export const Default: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getAllByRole('button', { name: 'Expand customer' })[0])
  },
  render: (args) => (
    <Gallery gap={32}>
      <Col label='basic scenario'>
        <TableControls {...args} />
      </Col>
    </Gallery>
  ),
}
