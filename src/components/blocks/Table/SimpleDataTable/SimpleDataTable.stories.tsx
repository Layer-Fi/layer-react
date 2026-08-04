import { useCallback, useMemo, useState } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'
import type { Row, RowSelectionState } from '@tanstack/react-table'

import { Button } from '@ui/Button/Button'
import { ExpandButton } from '@ui/ExpandButton/ExpandButton'
import type { ColumnConfig } from '@blocks/Table/DataTable/utils/column'
import { SimpleDataTable } from '@blocks/Table/SimpleDataTable/SimpleDataTable'
import {
  getInvoiceColumnConfig,
  INVOICE_ROWS,
  InvoiceExpandedRow,
  type InvoiceRow,
  TABLE_STORY_COMPONENT_NAME,
  TABLE_STORY_SLOTS,
  TableStoryStyles,
} from '@blocks/Table/tableStoryData'

import { Gallery, Section } from '@test-utils/storybook/gallery'

const COLUMN_CONFIG = getInvoiceColumnConfig()
const SHORT_LIST = INVOICE_ROWS.slice(0, 4)

const meta: Meta<typeof SimpleDataTable<InvoiceRow>> = {
  title: 'Blocks/Tables/SimpleDataTable',
  component: SimpleDataTable,
  args: {
    data: INVOICE_ROWS,
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

type Story = StoryObj<typeof SimpleDataTable<InvoiceRow>>

const SelectableTable = () => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({
    'invoice-1042': true,
    'invoice-1043': true,
  })

  const selectionProps = useMemo(() => ({
    rowSelection,
    onRowSelectionChange: setRowSelection,
    selectAllAriaLabel: 'Select all invoices',
    getRowSelectionAriaLabel: (row: Row<InvoiceRow>) => `Select ${row.original.reference}`,
    enableRowSelection: (row: Row<InvoiceRow>) => row.original.status !== 'Paid',
  }), [rowSelection])

  return (
    <SimpleDataTable
      data={INVOICE_ROWS}
      columnConfig={COLUMN_CONFIG}
      componentName={TABLE_STORY_COMPONENT_NAME}
      ariaLabel='Selectable invoices'
      isLoading={false}
      isError={false}
      slots={TABLE_STORY_SLOTS}
      selectionProps={selectionProps}
      isRowSelected={row => row.getIsSelected()}
    />
  )
}

const ExpandableRowTable = () => {
  const columnConfig = useMemo<ColumnConfig<InvoiceRow>>(() => [
    {
      id: 'Expand',
      header: '',
      cell: row => (
        <Button
          variant='ghost'
          icon
          inset
          onPress={() => row.toggleExpanded()}
          aria-label={row.getIsExpanded() ? 'Collapse invoice' : 'Expand invoice'}
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
    render: (row: Row<InvoiceRow>) => <InvoiceExpandedRow row={row} />,
  }), [])

  return (
    <SimpleDataTable
      data={SHORT_LIST}
      columnConfig={columnConfig}
      componentName={TABLE_STORY_COMPONENT_NAME}
      ariaLabel='Invoices with detail rows'
      isLoading={false}
      isError={false}
      slots={TABLE_STORY_SLOTS}
      expandedRowProps={expandedRowProps}
    />
  )
}

const ClickableRowTable = () => {
  const [activeId, setActiveId] = useState('invoice-1043')

  const withClickableRow = useMemo(() => ({
    onRowClick: (row: Row<InvoiceRow>) => setActiveId(row.original.id),
    isRowClickable: (row: Row<InvoiceRow>) => row.original.status !== 'Draft',
  }), [])

  const isRowSelected = useCallback(
    (row: Row<InvoiceRow>) => row.original.id === activeId,
    [activeId],
  )

  return (
    <SimpleDataTable
      data={SHORT_LIST}
      columnConfig={COLUMN_CONFIG}
      componentName={TABLE_STORY_COMPONENT_NAME}
      ariaLabel='Clickable invoices'
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
  render: args => (
    <Gallery>
      <Section title='columnConfig — alignment, row header, rich cells'>
        <SimpleDataTable {...args} />
      </Section>
      <Section title='selectionProps — injected checkbox column, paid rows not selectable'>
        <SelectableTable />
      </Section>
      <Section title='expandedRowProps — inline detail beneath a flat row'>
        <ExpandableRowTable />
      </Section>
      <Section title='withClickableRow + isRowSelected — whole row is a target, active row highlighted'>
        <ClickableRowTable />
      </Section>
      <Section title='isLoading'>
        <SimpleDataTable {...args} data={undefined} isLoading />
      </Section>
      <Section title='isError — slots.ErrorState'>
        <SimpleDataTable {...args} data={undefined} isError />
      </Section>
      <Section title='empty — slots.EmptyState'>
        <SimpleDataTable {...args} data={[]} />
      </Section>
    </Gallery>
  ),
}
