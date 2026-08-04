import { type Meta, type StoryObj } from '@storybook/react-vite'

import {
  buildInvoiceRows,
  getInvoiceColumnConfig,
  type InvoiceRow,
  TABLE_STORY_COMPONENT_NAME,
  TABLE_STORY_SLOTS,
  TableStoryStyles,
} from '@blocks/Table/tableStoryData'
import { VirtualizedDataTable } from '@blocks/Table/VirtualizedDataTable/VirtualizedDataTable'

import { Col, Gallery, Section } from '@test-utils/storybook/gallery'

const COLUMN_CONFIG = getInvoiceColumnConfig()
const LONG_LIST = buildInvoiceRows(2000)
const SHORT_LIST = buildInvoiceRows(4)

const meta: Meta<typeof VirtualizedDataTable<InvoiceRow>> = {
  title: 'Blocks/Tables/VirtualizedDataTable',
  component: VirtualizedDataTable,
  args: {
    data: LONG_LIST,
    columnConfig: COLUMN_CONFIG,
    componentName: TABLE_STORY_COMPONENT_NAME,
    ariaLabel: 'Invoices',
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

type Story = StoryObj<typeof VirtualizedDataTable<InvoiceRow>>

/**
 * 2,000 rows in one continuous scroll with a sticky header — only the visible window plus
 * `overscan` rows is mounted — then the height knobs, then the data states. Loading is a skeleton
 * table as in the other variants; error and empty replace the table with a centered state rather
 * than rendering as fallback rows, which is where this variant differs.
 */
export const Default: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: args => (
    <Gallery>
      <Section title='2,000 rows, sticky header'>
        <VirtualizedDataTable {...args} />
      </Section>
      <Section title='height and rowHeight'>
        <Gallery>
          <Col label='shrinkHeightToFitRows, 4 rows'>
            <VirtualizedDataTable {...args} data={SHORT_LIST} shrinkHeightToFitRows />
          </Col>
          <Col label='height=320, rowHeight=72'>
            <VirtualizedDataTable {...args} height={320} rowHeight={72} />
          </Col>
        </Gallery>
      </Section>
      <Section title='data states'>
        <Gallery>
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
      </Section>
    </Gallery>
  ),
}
