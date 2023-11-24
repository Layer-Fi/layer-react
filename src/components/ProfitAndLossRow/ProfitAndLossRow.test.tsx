import React from 'react'
import { Direction } from '../../types'
import { ProfitAndLossRow } from './ProfitAndLossRow'
import { render, screen } from '@testing-library/react'

describe(ProfitAndLossRow, () => {
  it('renders a key and value field for a LineItem', async () => {
    const lineItem = {
      display_name: 'Bob',
      value: 100123,
    }

    render(<ProfitAndLossRow lineItem={lineItem} />)

    const label = await screen.findByText('Bob')
    const value = await screen.findByText('1001.23')
    expect(label).toHaveClass('Layer__profit-and-loss-row__label')
    expect(value).toHaveClass('Layer__profit-and-loss-row__value')
  })

  it('renders positive money direction', async () => {
    const lineItem = {
      display_name: 'Bob',
      value: 100123,
    }

    render(
      <ProfitAndLossRow lineItem={lineItem} direction={Direction.CREDIT} />,
    )

    const label = await screen.findByText('Bob')
    const value = await screen.findByText('1001.23')
    expect(label).not.toHaveClass(
      'Layer__profit-and-loss-row__label--amount-positive',
    )
    expect(value).toHaveClass(
      'Layer__profit-and-loss-row__value',
      'Layer__profit-and-loss-row__value--amount-positive',
    )
  })

  it('renders negative money direction', async () => {
    const lineItem = {
      display_name: 'Bob',
      value: 100123,
    }

    render(<ProfitAndLossRow lineItem={lineItem} direction={Direction.DEBIT} />)

    const label = await screen.findByText('Bob')
    const value = await screen.findByText('1001.23')
    expect(label).not.toHaveClass(
      'Layer__profit-and-loss-row__label--amount-negative',
    )
    expect(value).toHaveClass(
      'Layer__profit-and-loss-row__value',
      'Layer__profit-and-loss-row__value--amount-negative',
    )
  })

  it('renders nested LineItems up to maxDepth', async () => {
    const lineItem = {
      display_name: 'Bob',
      value: 1001,
      line_items: [
        {
          display_name: 'Jan',
          value: 1002,
          line_items: [
            {
              display_name: 'Dave',
              value: 1003,
            },
          ],
        },
        {
          display_name: 'Sue',
          value: 1004,
        },
      ],
    }

    render(<ProfitAndLossRow lineItem={lineItem} maxDepth={1} />)

    expect(await screen.findByText('Bob')).toHaveClass(
      'Layer__profit-and-loss-row__label',
    )
    expect(await screen.findByText('10.01')).toHaveClass(
      'Layer__profit-and-loss-row__value',
    )
    expect(await screen.findByText('Jan')).toHaveClass(
      'Layer__profit-and-loss-row__label',
      'Layer__profit-and-loss-row__label--depth-1',
    )
    expect(await screen.findByText('10.02')).toHaveClass(
      'Layer__profit-and-loss-row__value',
      'Layer__profit-and-loss-row__value--depth-1',
    )
    expect(screen.queryByText('Dave')).not.toBeInTheDocument()
    expect(screen.queryByText('10.03')).not.toBeInTheDocument()
    expect(await screen.findByText('Sue')).toHaveClass(
      'Layer__profit-and-loss-row__label',
      'Layer__profit-and-loss-row__label--depth-1',
    )
    expect(await screen.findByText('10.04')).toHaveClass(
      'Layer__profit-and-loss-row__value',
      'Layer__profit-and-loss-row__value--depth-1',
    )
  })
})
