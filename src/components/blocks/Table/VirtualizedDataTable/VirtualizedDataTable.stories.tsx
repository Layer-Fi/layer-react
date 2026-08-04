import { type Meta, type StoryObj } from '@storybook/react-vite'

import { VirtualizedDataTable } from '@blocks/Table/VirtualizedDataTable/VirtualizedDataTable'

import { Col, Gallery } from '@test-utils/storybook/gallery'
import {
  buildCustomerRows,
  type CustomerRow,
  getCustomerColumnConfig,
  TABLE_STORY_COMPONENT_NAME,
  TABLE_STORY_SLOTS,
  TableStoryStyles,
} from '@test-utils/storybook/tableStoryData'

const COLUMN_CONFIG = getCustomerColumnConfig()
const LONG_LIST = buildCustomerRows(2000)
const SHORT_LIST = buildCustomerRows(4)

const meta: Meta<typeof VirtualizedDataTable<CustomerRow>> = {
  title: 'Blocks/Table/VirtualizedDataTable',
  component: VirtualizedDataTable,
  args: {
    data: LONG_LIST,
    columnConfig: COLUMN_CONFIG,
    componentName: TABLE_STORY_COMPONENT_NAME,
    ariaLabel: 'Customers',
    isLoading: false,
    isError: false,
    slots: TABLE_STORY_SLOTS,
  },
  decorators: [
    Story => (
      <>
        <TableStoryStyles />
        <Story />
      </>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof VirtualizedDataTable<CustomerRow>>

/**
 * 2,000 rows in one continuous scroll with a sticky header — only the visible window plus
 * `overscan` rows is mounted — then the height knobs, then the data states, which render as they do
 * in every other variant: a skeleton table for loading, a full-width fallback row under a header
 * that stays put for error and empty.
 */
export const Default: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: args => (
    <Gallery gap={32}>
      <Col label='2,000 rows, sticky header'>
        <VirtualizedDataTable {...args} />
      </Col>
      <Col label='shrinkHeightToFitRows, 4 rows'>
        <VirtualizedDataTable {...args} data={SHORT_LIST} shrinkHeightToFitRows />
      </Col>
      <Col label='height=320, rowHeight=72'>
        <VirtualizedDataTable {...args} height={320} rowHeight={72} />
      </Col>
      <Col label='isLoading'>
        <VirtualizedDataTable {...args} data={undefined} isLoading />
      </Col>
      <Col label='isError'>
        <VirtualizedDataTable {...args} data={undefined} isError />
      </Col>
      <Col label='empty'>
        <VirtualizedDataTable {...args} data={[]} />
      </Col>
    </Gallery>
  ),
}
