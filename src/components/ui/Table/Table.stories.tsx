import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Alignment } from '@schemas/common/table'
import { Cell, Column, Row, Table, TableBody, TableHeader } from '@ui/Table/Table'

import { Col, Gallery, Section } from '@test-utils/storybook/gallery'

type ColumnKey = 'account' | 'debit' | 'credit'

const COLUMNS: { key: ColumnKey, label: string, alignment: Alignment, isRowHeader?: boolean }[] = [
  { key: 'account', label: 'Account', alignment: Alignment.Left, isRowHeader: true },
  { key: 'debit', label: 'Debit', alignment: Alignment.Right },
  { key: 'credit', label: 'Credit', alignment: Alignment.Right },
]

const ROWS: Record<'id' | ColumnKey, string>[] = [
  { id: '1', account: 'Cash', debit: '$1,200.00', credit: '' },
  { id: '2', account: 'Accounts Receivable', debit: '$800.00', credit: '' },
  { id: '3', account: 'Revenue', debit: '', credit: '$2,000.00' },
]

const NESTED_ROWS: { id: string, account: string, depth: number, amount: string }[] = [
  { id: 'income', account: 'Income', depth: 0, amount: '$18,400.00' },
  { id: 'services', account: 'Services', depth: 1, amount: '$14,900.00' },
  { id: 'consulting', account: 'Consulting', depth: 2, amount: '$9,400.00' },
  { id: 'retainers', account: 'Retainers', depth: 2, amount: '$5,500.00' },
  { id: 'product', account: 'Product', depth: 1, amount: '$3,500.00' },
  { id: 'expenses', account: 'Expenses', depth: 0, amount: '$7,250.00' },
]

const PERIODS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

const PERIOD_ROWS = [
  { id: 'revenue', account: 'Revenue', values: [6100, 5900, 6400, 7000, 6800, 7200], total: 39400 },
  { id: 'cogs', account: 'Cost of Goods Sold', values: [2100, 1950, 2200, 2400, 2300, 2500], total: 13450 },
  { id: 'payroll', account: 'Payroll', values: [3000, 3000, 3100, 3100, 3200, 3200], total: 18600 },
  { id: 'software', account: 'Software and Subscriptions', values: [420, 420, 480, 480, 510, 510], total: 2820 },
]

const money = (value: number) => `$${value.toLocaleString()}`

const STYLES = `
  .StoryTable {
    table-layout: fixed;
    width: 100%;
  }

  .StoryTable--journal .Layer__UI__Table-Row,
  .StoryTable--journal .Layer__UI__Table-TableHeader > tr {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 7rem 7rem;
  }

  .StoryTable--nested .Layer__UI__Table-Row,
  .StoryTable--nested .Layer__UI__Table-TableHeader > tr {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 9rem;
  }

  .StoryTable--periods .Layer__UI__Table-Row,
  .StoryTable--periods .Layer__UI__Table-TableHeader > tr,
  .StoryTable--periods thead > tr {
    display: grid;
    grid-template-columns: 14rem repeat(6, 7rem) 9rem;
  }

  .StoryTable--periods [data-pinned='left'] {
    position: sticky;
    inset-inline-start: 0;
  }

  .StoryTable--periods [data-pinned='right'] {
    position: sticky;
    inset-inline-end: 0;
  }

  .StoryTable--periods .StoryTable__GroupSpan {
    grid-column: span 3;
  }
`

const meta: Meta = {
  title: 'UI/Table',
}

export default meta

type Story = StoryObj

const Indent = ({ depth, children }: { depth: number, children: string }) => (
  <span style={{ paddingInlineStart: depth * 16 }}>{children}</span>
)

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery gap={40}>
      <style>{STYLES}</style>
      <Section title='Columns and alignment'>
        <Col label='row header, right-aligned amounts' inlineSize={560}>
          <div className='Layer__UI__Table-ScrollContainer'>
            <Table aria-label='Journal entries' className='StoryTable StoryTable--journal'>
              <TableHeader>
                {COLUMNS.map(col => (
                  <Column key={col.key} isRowHeader={col.isRowHeader} alignment={col.alignment}>
                    {col.label}
                  </Column>
                ))}
              </TableHeader>
              <TableBody>
                {ROWS.map(row => (
                  <Row key={row.id}>
                    {COLUMNS.map(col => (
                      <Cell key={col.key} alignment={col.alignment}>{row[col.key]}</Cell>
                    ))}
                  </Row>
                ))}
              </TableBody>
            </Table>
          </div>
        </Col>
      </Section>

      <Section title='Nested rows'>
        <Col label='depth 0, 1 and 2 shade the row background' inlineSize={560}>
          <div className='Layer__UI__Table-ScrollContainer'>
            <Table aria-label='Report totals' className='StoryTable StoryTable--nested'>
              <TableHeader>
                <Column isRowHeader alignment={Alignment.Left}>Account</Column>
                <Column alignment={Alignment.Right}>Total</Column>
              </TableHeader>
              <TableBody>
                {NESTED_ROWS.map(({ id, account, depth, amount }) => (
                  <Row key={id} depth={depth}>
                    <Cell alignment={Alignment.Left}>
                      <Indent depth={depth}>{account}</Indent>
                    </Cell>
                    <Cell alignment={Alignment.Right}>{amount}</Cell>
                  </Row>
                ))}
              </TableBody>
            </Table>
          </div>
        </Col>
      </Section>

      <Section title='Pinned columns with horizontal overflow'>
        <Col label='account pinned left, total pinned right' inlineSize={620}>
          <div className='Layer__UI__Table-ScrollContainer Layer__UI__Table-ScrollContainer--has-horizontal-overflow'>
            <Table aria-label='Monthly profit and loss' className='StoryTable StoryTable--periods'>
              <TableHeader>
                <Column isRowHeader alignment={Alignment.Left} pinned='left'>Account</Column>
                {PERIODS.map(period => (
                  <Column key={period} alignment={Alignment.Right}>{period}</Column>
                ))}
                <Column alignment={Alignment.Right} pinned='right'>Total</Column>
              </TableHeader>
              <TableBody>
                {PERIOD_ROWS.map(({ id, account, values, total }) => (
                  <Row key={id}>
                    <Cell alignment={Alignment.Left} pinned='left'>{account}</Cell>
                    {values.map((value, index) => (
                      <Cell key={PERIODS[index]} alignment={Alignment.Right}>{money(value)}</Cell>
                    ))}
                    <Cell alignment={Alignment.Right} pinned='right'>{money(total)}</Cell>
                  </Row>
                ))}
              </TableBody>
            </Table>
          </div>
        </Col>
      </Section>

      <Section title='Grouped header'>
        <Col label='two header rows; grid rows need a column span, not colSpan' inlineSize={1100}>
          <div className='Layer__UI__Table-ScrollContainer'>
            <Table nonAria className='StoryTable StoryTable--periods'>
              <TableHeader nonAria>
                <Row nonAria>
                  <Column nonAria alignment={Alignment.Left}>Account</Column>
                  <Column nonAria alignment={Alignment.Center} colSpan={3} className='StoryTable__GroupSpan'>
                    Q1
                  </Column>
                  <Column nonAria alignment={Alignment.Center} colSpan={3} className='StoryTable__GroupSpan'>
                    Q2
                  </Column>
                  <Column nonAria alignment={Alignment.Right}>Total</Column>
                </Row>
                <Row nonAria>
                  <Column nonAria alignment={Alignment.Left}></Column>
                  {PERIODS.map(period => (
                    <Column key={period} nonAria alignment={Alignment.Right}>{period}</Column>
                  ))}
                  <Column nonAria alignment={Alignment.Right}></Column>
                </Row>
              </TableHeader>
              <TableBody nonAria>
                {PERIOD_ROWS.map(({ id, account, values, total }) => (
                  <Row key={id} nonAria>
                    <Cell nonAria alignment={Alignment.Left}>{account}</Cell>
                    {values.map((value, index) => (
                      <Cell key={PERIODS[index]} nonAria alignment={Alignment.Right}>{money(value)}</Cell>
                    ))}
                    <Cell nonAria alignment={Alignment.Right}>{money(total)}</Cell>
                  </Row>
                ))}
              </TableBody>
            </Table>
          </div>
        </Col>
      </Section>
    </Gallery>
  ),
}
