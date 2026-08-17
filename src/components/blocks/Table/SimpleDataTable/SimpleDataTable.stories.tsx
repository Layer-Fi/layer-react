import { useCallback, useMemo, useState } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'
import type { Row, RowSelectionState } from '@tanstack/react-table'
import { userEvent, within } from 'storybook/test'

import { pickCyclic } from '@utils/shared/array/pickCyclic'
import { Button } from '@ui/Button/Button'
import { ExpandButton } from '@ui/ExpandButton/ExpandButton'
import type { ColumnConfig } from '@blocks/Table/DataTable/utils/column'
import { SimpleDataTable } from '@blocks/Table/SimpleDataTable/SimpleDataTable'
import { CUSTOMER_ROWS, CustomerExpandedRow } from '@blocks/Table/SimpleDataTable/SimpleDataTable.storyData'

import {
  type CustomerRow,
  getCustomerColumnConfig,
  TABLE_STORY_COMPONENT_NAME,
  TABLE_STORY_SLOTS,
  TableStoryStyles,
} from '@testUtils/storybook/data/tables'
import { firstMatch } from '@testUtils/storybook/interactions/firstMatch'
import { Col } from '@testUtils/storybook/layout/Col'
import { Gallery } from '@testUtils/storybook/layout/Gallery'

const COLUMN_CONFIG = getCustomerColumnConfig()
const SHORT_LIST = CUSTOMER_ROWS.slice(0, 4)

const PRESELECTED_ROWS: RowSelectionState = Object.fromEntries(
  CUSTOMER_ROWS.filter(row => row.status !== 'ARCHIVED').slice(0, 2).map(row => [row.id, true]),
)

const meta: Meta<typeof SimpleDataTable<CustomerRow>> = {
  title: 'Blocks/Table/SimpleDataTable',
  component: SimpleDataTable,
  args: {
    data: CUSTOMER_ROWS,
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

type Story = StoryObj<typeof SimpleDataTable<CustomerRow>>

const SelectableTable = () => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(PRESELECTED_ROWS)

  const selectionProps = useMemo(() => ({
    rowSelection,
    onRowSelectionChange: setRowSelection,
    selectAllAriaLabel: 'Select all customers',
    getRowSelectionAriaLabel: (row: Row<CustomerRow>) => `Select ${row.original.companyName ?? row.original.individualName ?? row.original.id}`,
    enableRowSelection: (row: Row<CustomerRow>) => row.original.status !== 'ARCHIVED',
  }), [rowSelection])

  return (
    <SimpleDataTable
      data={CUSTOMER_ROWS}
      columnConfig={COLUMN_CONFIG}
      componentName={TABLE_STORY_COMPONENT_NAME}
      ariaLabel='Selectable customers'
      isLoading={false}
      isError={false}
      slots={TABLE_STORY_SLOTS}
      selectionProps={selectionProps}
      isRowSelected={row => row.getIsSelected()}
    />
  )
}

const ExpandableRowTable = () => {
  const columnConfig = useMemo<ColumnConfig<CustomerRow>>(() => [
    {
      id: 'Expand',
      header: '',
      cell: row => (
        <Button
          variant='ghost'
          icon
          inset
          onPress={() => row.toggleExpanded()}
          aria-label={row.getIsExpanded() ? 'Collapse customer' : 'Expand customer'}
        >
          <ExpandButton isExpanded={row.getIsExpanded()} />
        </Button>
      ),
      preventRowClick: true,
    },
    ...COLUMN_CONFIG,
  ], [])

  const expandedRowProps = useMemo(() => ({
    getRowCanExpand: () => true,
    render: (row: Row<CustomerRow>) => <CustomerExpandedRow row={row} />,
  }), [])

  return (
    <SimpleDataTable
      data={SHORT_LIST}
      columnConfig={columnConfig}
      componentName={TABLE_STORY_COMPONENT_NAME}
      ariaLabel='Customers with detail rows'
      isLoading={false}
      isError={false}
      slots={TABLE_STORY_SLOTS}
      expandedRowProps={expandedRowProps}
    />
  )
}

const ClickableRowTable = () => {
  const [activeId, setActiveId] = useState(pickCyclic(SHORT_LIST, 2).id)

  const withClickableRow = useMemo(() => ({
    onRowClick: (row: Row<CustomerRow>) => setActiveId(row.original.id),
    isRowClickable: (row: Row<CustomerRow>) => row.original.status !== 'ARCHIVED',
  }), [])

  const isRowSelected = useCallback(
    (row: Row<CustomerRow>) => row.original.id === activeId,
    [activeId],
  )

  return (
    <SimpleDataTable
      data={SHORT_LIST}
      columnConfig={COLUMN_CONFIG}
      componentName={TABLE_STORY_COMPONENT_NAME}
      ariaLabel='Clickable customers'
      isLoading={false}
      isError={false}
      slots={TABLE_STORY_SLOTS}
      withClickableRow={withClickableRow}
      isRowSelected={isRowSelected}
    />
  )
}

/**
 * Everything `SimpleDataTable` does, in one render: rich cells with per-column alignment and a row
 * header, the row-level features that can't coexist in one table, and the loading / error / empty
 * states the table owns from `isLoading` / `isError` / an empty array.
 */
export const Default: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  play: async ({ canvasElement }) => {
    await userEvent.click(firstMatch(within(canvasElement).getAllByRole('button', { name: 'Expand customer' })))
  },
  render: args => (
    <Gallery gap={32}>
      <Col label='columnConfig — alignment, row header, rich cells'>
        <SimpleDataTable {...args} />
      </Col>
      <Col label='selectionProps — injected checkbox column, archived rows not selectable'>
        <SelectableTable />
      </Col>
      <Col label='expandedRowProps — inline detail beneath a flat row, first row expanded'>
        <ExpandableRowTable />
      </Col>
      <Col label='withClickableRow + isRowSelected — active row highlighted'>
        <ClickableRowTable />
      </Col>
      <Col label='isLoading'>
        <SimpleDataTable {...args} data={undefined} isLoading />
      </Col>
      <Col label='isError — slots.ErrorState'>
        <SimpleDataTable {...args} data={undefined} isError />
      </Col>
      <Col label='empty — slots.EmptyState'>
        <SimpleDataTable {...args} data={[]} />
      </Col>
    </Gallery>
  ),
}
