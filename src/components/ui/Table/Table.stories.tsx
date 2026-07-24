import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Cell, Column, Row, Table, TableBody, TableHeader } from '@ui/Table/Table'

const ROWS = [
  { id: '1', account: 'Cash', debit: '$1,200.00', credit: '' },
  { id: '2', account: 'Accounts Receivable', debit: '$800.00', credit: '' },
  { id: '3', account: 'Revenue', debit: '', credit: '$2,000.00' },
]

const meta: Meta = {
  title: 'UI/Table',
}

export default meta

type Story = StoryObj

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ padding: 24, maxWidth: 560 }}>
      <Table aria-label='Journal entries'>
        <TableHeader>
          <Column isRowHeader>Account</Column>
          <Column>Debit</Column>
          <Column>Credit</Column>
        </TableHeader>
        <TableBody>
          {ROWS.map(row => (
            <Row key={row.id}>
              <Cell>{row.account}</Cell>
              <Cell>{row.debit}</Cell>
              <Cell>{row.credit}</Cell>
            </Row>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}
