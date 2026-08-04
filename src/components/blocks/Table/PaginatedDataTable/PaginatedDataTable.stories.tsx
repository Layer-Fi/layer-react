import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PaginatedTable } from '@blocks/Table/PaginatedDataTable/PaginatedDataTable'
import {
  buildInvoiceRows,
  getInvoiceColumnConfig,
  getPinnedInvoiceColumnConfig,
  type InvoiceRow,
  PINNED_STORY_COMPONENT_NAME,
  TABLE_STORY_COMPONENT_NAME,
  TABLE_STORY_SLOTS,
  TableStoryStyles,
} from '@blocks/Table/tableStoryData'

import { Col, Gallery } from '@test-utils/storybook/gallery'

const COLUMN_CONFIG = getInvoiceColumnConfig()
const PINNED_COLUMN_CONFIG = getPinnedInvoiceColumnConfig()
const ROWS = buildInvoiceRows(43)

const meta: Meta<typeof PaginatedTable<InvoiceRow>> = {
  title: 'Blocks/Tables/PaginatedDataTable',
  component: PaginatedTable,
  args: {
    data: ROWS,
    columnConfig: COLUMN_CONFIG,
    componentName: TABLE_STORY_COMPONENT_NAME,
    ariaLabel: 'Invoices',
    isLoading: false,
    isError: false,
    slots: TABLE_STORY_SLOTS,
    paginationProps: { pageSize: 8 },
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

type Story = StoryObj<typeof PaginatedTable<InvoiceRow>>

/**
 * 43 rows behind the pager the table renders for you, then the same table with ten columns and
 * pinning — `No.` frozen left, `Status` and the action column frozen right, the rest scrolling.
 */
export const Default: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: args => (
    <Gallery gap={32}>
      <Col label='paginationProps — 8 rows per page'>
        <PaginatedTable {...args} />
      </Col>
      <Col label='pinning — left and right columns frozen while the middle scrolls'>
        <PaginatedTable
          {...args}
          columnConfig={PINNED_COLUMN_CONFIG}
          componentName={PINNED_STORY_COMPONENT_NAME}
          paginationProps={{ pageSize: 6 }}
        />
      </Col>
    </Gallery>
  ),
}
